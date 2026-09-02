import { MessageCircle, Users, UserCheck, Repeat, Crown, Plus, Pencil } from 'lucide-react';
import { RecordForm } from '@/components/admin/RecordForm';
import { camposCliente } from '@/components/admin/campos';
import { PageHeader, Panel, StatCard, Money, Avatar } from '@/components/admin/Ui';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { CustomerBadge } from '@/components/ui/Badge';
import { getCustomers, getSales, getExpirations } from '@/lib/queries';
import { formatDateShort, formatMoney, formatNumber, etiquetaCliente, contactoCliente } from '@/lib/format';
import { waLink } from '@/lib/whatsapp';
import { site } from '@/config/site';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Clientes' };

export default async function ClientesPage() {
  const [clientes, ventas, vencimientos] = await Promise.all([
    getCustomers(),
    getSales(),
    getExpirations(),
  ]);

  const validas = ventas.filter((v) => ['pagada', 'entregada'].includes(v.estado));

  const enriquecidos = clientes.map((c) => {
    const suyas = validas.filter((v) => v.customer_id === c.id);
    const activos = vencimientos.filter(
      (v) => v.customer_id === c.id && ['activa', 'vendida', 'por_vencer'].includes(v.estado),
    );
    return {
      ...c,
      compras: suyas.length,
      total: suyas.reduce((a, v) => a + v.precio, 0),
      ganancia: suyas.reduce((a, v) => a + v.ganancia, 0),
      ultima: suyas[0]?.fecha ?? null,
      activos: activos.length,
    };
  });

  const recurrentes = enriquecidos.filter((c) => c.compras > 1).length;
  const ingresoTotal = enriquecidos.reduce((a, c) => a + c.total, 0);
  const mejor = [...enriquecidos].sort((a, b) => b.total - a.total)[0];

  const rows: TableRow[] = enriquecidos.map((c) => ({
    id: c.id,
    tags: { estado: c.estado },
    search: [c.nombre, c.usuario, c.whatsapp, c.email, c.notas].filter(Boolean).join(' '),
    sort: [etiquetaCliente(c), c.whatsapp ?? '', c.compras, c.activos, c.total, c.ganancia,
      c.ultima ? new Date(c.ultima).getTime() : 0, c.estado, ''],
    cells: [
      <div key="n" className="flex items-center gap-2.5">
        <Avatar nombre={etiquetaCliente(c)} />
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{etiquetaCliente(c)}</p>
          {c.email && <p className="truncate text-xs text-white/35">{c.email}</p>}
        </div>
      </div>,
      <div key="w" className="min-w-0">
        {c.whatsapp && <p className="tabular-nums text-white/60">{c.whatsapp}</p>}
        {c.usuario && <p className="truncate text-xs text-brand-300">@{c.usuario.replace(/^@/, '')}</p>}
        {!c.whatsapp && !c.usuario && <span className="text-white/25">—</span>}
      </div>,
      <span key="c" className="tabular-nums text-white/70">{c.compras}</span>,
      <span key="a" className={c.activos > 0 ? 'font-semibold text-emerald-300' : 'text-white/35'}>
        {c.activos}
      </span>,
      <Money key="t" value={c.total} />,
      <Money key="g" value={c.ganancia} positivo />,
      <span key="u" className="whitespace-nowrap text-white/50">{formatDateShort(c.ultima)}</span>,
      <CustomerBadge key="e" estado={c.estado} />,
      <div key="ac" className="flex justify-end gap-1.5">
        <RecordForm
          tabla="customers"
          id={c.id}
          titulo={`Editar a ${etiquetaCliente(c)}`}
          campos={camposCliente(c)}
          botonLabel="Editar"
          botonClase="btn-ghost btn-sm"
          botonIcono={<Pencil className="h-3.5 w-3.5" />}
          permiteBorrar
        />
        {c.whatsapp ? (
          <a
            href={waLink(
              `¡Hola${c.nombre ? ` ${c.nombre}` : ''}! 👋 Te escribimos de ${site.name}.`,
              c.whatsapp,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp btn-sm"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Escribir
          </a>
        ) : (
          <span
            className="whitespace-nowrap text-xs text-white/30"
            title="WhatsApp todavía no deja abrir un chat con un enlace usando solo el usuario"
          >
            solo @usuario
          </span>
        )}
      </div>,
    ],
  }));

  return (
    <div>
      <PageHeader
        titulo="Clientes"
        descripcion="Tu base de clientes con historial de compras, servicios activos y valor generado."
      >
        <RecordForm
          tabla="customers"
          titulo="Nuevo cliente"
          descripcion="Con el número o el @usuario basta. El nombre es opcional."
          campos={camposCliente()}
          botonLabel="Nuevo cliente"
          botonIcono={<Plus className="h-3.5 w-3.5" />}
        />
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes totales" value={formatNumber(clientes.length)} hint={`${clientes.filter((c) => c.estado === 'activo').length} activos`} icon={Users} tono="brand" />
        <StatCard label="Clientes recurrentes" value={formatNumber(recurrentes)} hint="Con más de una compra" icon={Repeat} tono="green" />
        <StatCard label="Ingresos generados" value={formatMoney(ingresoTotal)} hint="Histórico de todos los clientes" icon={UserCheck} tono="blue" />
        <StatCard label="Mejor cliente" value={mejor?.nombre ?? '—'} hint={mejor ? formatMoney(mejor.total) : 'Sin datos'} icon={Crown} tono="amber" />
      </div>

      <Panel>
        <DataTable
          headers={['Cliente', 'Contacto', 'Compras', 'Activos', 'Total gastado', 'Ganancia', 'Última compra', 'Estado', 'Acción']}
          rows={rows}
          alignRight={[4, 5]}
          defaultSort={{ index: 4, dir: 'desc' }}
          searchPlaceholder="Buscar por nombre, usuario, WhatsApp o correo…"
          filters={[
            {
              key: 'estado',
              label: 'Estado',
              options: [
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'moroso', label: 'Moroso' },
                { value: 'bloqueado', label: 'Bloqueado' },
              ],
            },
          ]}
          emptyTitle="Sin clientes registrados"
          emptyText="Cada vez que cierres una venta por WhatsApp registra al cliente para llevar su historial."
        />
      </Panel>
    </div>
  );
}
