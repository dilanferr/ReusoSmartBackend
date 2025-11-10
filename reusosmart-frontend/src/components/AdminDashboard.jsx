import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, LineChart, PieChart, Pie, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Bar, Cell } from 'recharts'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Bell, Users, Factory, Recycle, Award, AlertTriangle } from 'lucide-react'

const API_BASE = 'http://localhost:5000/api'

function useDashboardData() {
  const [points, setPoints] = useState([])
  const [usersCount, setUsersCount] = useState({ total: 0, admins: 0, activos: 0 })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [pRes, uRes, listRes] = await Promise.all([
          fetch(`${API_BASE}/puntos?region=Santiago`),
          fetch(`${API_BASE}/users/count`),
          fetch(`${API_BASE}/users`),
        ])
        if (!pRes.ok) throw new Error('Error al obtener puntos')
        if (!uRes.ok) throw new Error('Error al obtener conteo de usuarios')
        if (!listRes.ok) throw new Error('Error al listar usuarios')
        const [pData, uData, listData] = await Promise.all([pRes.json(), uRes.json(), listRes.json()])
        if (!cancelled) {
          setPoints(Array.isArray(pData) ? pData : [])
          setUsersCount(uData || { total: 0, admins: 0, activos: 0 })
          setUsers(Array.isArray(listData) ? listData : [])
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error al cargar datos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: newRole })
      })
      if (!res.ok) throw new Error('No se pudo actualizar rol')
      const data = await res.json()
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, rol: data.usuario?.rol ?? newRole } : u))
      // Actualizar conteo de admins
      const adminsNow = (prev => prev)(null) // no-op to keep lints quiet
      const adminsCount = (users.filter(u => (u._id === userId ? (data.usuario?.rol ?? newRole) : u.rol) === 2)).length
      setUsersCount(c => ({ ...c, admins: adminsCount }))
    } catch (e) {
      setError(e.message || 'Error al cambiar rol')
    }
  }

  return { points, usersCount, users, loading, error, updateUserRole }
}

// KPIs derivados de datos reales
function useKPIs(points, usersCount) {
  const kpis = useMemo(() => {
    const totalPuntos = points.length
    const validos = points.filter(p => Number.isFinite(p.latitud) && Number.isFinite(p.longitud)).length
    const porcentajeValidos = totalPuntos ? Math.round((validos / totalPuntos) * 100) : 0

    // Comuna con más puntos
    const porComuna = points.reduce((acc, p) => {
      const key = p.comuna_nombre || 'Desconocida'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const topComuna = Object.entries(porComuna).sort((a,b) => b[1]-a[1])[0]
    const topComunaText = topComuna ? `${topComuna[0]} (${topComuna[1]})` : 'Sin datos'

    return [
      { titulo: 'Usuarios Registrados', valor: String(usersCount.total || 0), meta: 'crecimiento sostenido' },
      { titulo: 'Puntos en Santiago', valor: String(totalPuntos), meta: 'Región Metropolitana' },
      { titulo: 'Puntos con geolocalización', valor: `${porcentajeValidos}%`, meta: `${validos} de ${totalPuntos}` },
      { titulo: 'Comuna con más puntos', valor: topComunaText, meta: 'Fuente: API puntos' },
    ]
  }, [points, usersCount])
  return kpis
}

// Materiales agregados desde los puntos
function useMaterials(points) {
  return useMemo(() => {
    const counts = {}
    for (const p of points) {
      if (!p.materiales_aceptados) continue
      String(p.materiales_aceptados)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(m => { counts[m] = (counts[m] || 0) + 1 })
    }
    const entries = Object.entries(counts)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
    return entries.length ? entries : [{ name: 'Sin datos', value: 1 }]
  }, [points])
}

function _runSmokeTests() {
  try {
    console.assert(Array.isArray(pointsData) && pointsData.length > 0, 'pointsData no debe estar vacío')
    console.assert(Array.isArray(materialsData) && materialsData.length > 0, 'materialsData no debe estar vacío')
    console.assert(
      Array.isArray(kpiData) && kpiData.every(k => typeof k.titulo === 'string' && typeof k.valor === 'string' && typeof k.meta === 'string'),
      'kpiData debe contener strings en titulo/valor/meta'
    )
    console.assert(kpiData.every(k => !/[<>]/.test(k.meta)), "kpi.meta no debe incluir '<' ni '>'")
  } catch (e) {
    // Evita romper render en producción; sólo log de diagnóstico
    // eslint-disable-next-line no-console
    console.warn('Smoke tests del dashboard fallaron:', e)
  }
}
if (typeof window !== 'undefined') _runSmokeTests()

export default function AdminDashboard() {
  const { points, usersCount, users, loading, error, updateUserRole } = useDashboardData()
  const kpiData = useKPIs(points, usersCount)
  const materialsData = useMaterials(points)

  // Consolidar puntos por comuna para gráficos/tabla
  const pointsByComuna = useMemo(() => {
    const grouped = points.reduce((acc, p) => {
      const key = p.comuna_nombre || 'Desconocida'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return Object.entries(grouped).map(([name, puntos]) => ({ name, puntos }))
  }, [points])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Administración ReusoSmart</h1>
        <Button className="flex items-center gap-2"><Bell size={18}/> Notificaciones</Button>
      </div>

      {loading && <div className="text-sm text-gray-600">Cargando datos...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* KPIs Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">{kpi.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.valor}</p>
              <p className="text-xs text-gray-500">Meta: {kpi.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="ambiental">Impacto Ambiental</TabsTrigger>
          <TabsTrigger value="puntos">Puntos de Reciclaje</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="empresas">Empresas REP</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

      {/* Resumen: puntos por comuna de Santiago */}
      <TabsContent value="resumen">
        <Card>
          <CardHeader><CardTitle>Resumen General</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pointsByComuna}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-15} height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="puntos" stroke="#10b981" name="Puntos por comuna" />
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

        {/* Impacto Ambiental */}
        <TabsContent value="ambiental">
          <Card>
            <CardHeader><CardTitle>Distribución de Materiales Recuperados</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={materialsData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {materialsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Puntos: tabla por comuna */}
        <TabsContent value="puntos">
          <Card>
            <CardHeader><CardTitle>Estadísticas por Punto de Reciclaje</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Comuna</TableCell>
                    <TableCell>Cantidad de puntos</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsByComuna.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.puntos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuarios: gestión detallada */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader><CardTitle>Gestión de Usuarios</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3"><Users size={18}/> <span>Usuarios Registrados: {usersCount.total}</span></div>
              <div className="flex items-center gap-3"><Award size={18}/> <span>Usuarios Activos: {usersCount.activos}</span></div>
              <div className="flex items-center gap-3"><Recycle size={18}/> <span>Administradores: {usersCount.admins}</span></div>

              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Activo</TableCell>
                      <TableCell>Registro</TableCell>
                      <TableCell>Último acceso</TableCell>
                      <TableCell>Bloqueado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u._id}>
                        <TableCell>{u.nombre}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.rol === 2 ? 'Admin' : 'Usuario'}</TableCell>
                        <TableCell>{u.activo ? 'Sí' : 'No'}</TableCell>
                        <TableCell>{u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{u.seguridad?.ultimo_acceso ? new Date(u.seguridad.ultimo_acceso).toLocaleString() : '-'}</TableCell>
                        <TableCell>{u.seguridad?.bloqueado ? 'Sí' : 'No'}</TableCell>
                        <TableCell>
                          {u.rol === 2 ? (
                            <Button variant="outline" size="sm" onClick={() => updateUserRole(u._id, 1)}>Quitar admin</Button>
                          ) : (
                            <Button size="sm" onClick={() => updateUserRole(u._id, 2)}>Hacer admin</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Empresas REP: aproximación con administradores/encargados únicos en puntos */}
        <TabsContent value="empresas">
          <Card>
            <CardHeader><CardTitle>Empresas REP y Cumplimiento</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3"><Factory size={18}/> <span>Organizaciones únicas: {Array.from(new Set(points.map(p => p.administrador).filter(Boolean))).length}</span></div>
                <div className="flex items-center gap-3"><Recycle size={18}/> <span>Región: Metropolitana de Santiago</span></div>
                <Button className="mt-3">Generar Informe REP</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alertas: datos faltantes */}
        <TabsContent value="alertas">
          <Card>
            <CardHeader><CardTitle>Alertas del Sistema</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {points.filter(p => !p.telefono || !p.horario).slice(0,4).map((p,i) => (
                <div key={i} className="flex items-center gap-2 text-yellow-600"><AlertTriangle size={18}/> Datos incompletos en {p.comuna_nombre || 'Comuna desconocida'} ({p.direccion_completa || 'dirección no disponible'})</div>
              ))}
              {!points.length && (
                <div className="flex items-center gap-2 text-red-600"><AlertTriangle size={18}/> No se recibieron puntos desde la API</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}