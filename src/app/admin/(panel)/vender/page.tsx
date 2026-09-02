import { PageHeader } from '@/components/admin/Ui';
import { NuevaVenta } from '@/components/admin/NuevaVenta';
import { getCustomers, getServicesAdmin, getAccountSlots, getProviderOptions } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nueva venta' };

export default async function VenderPage() {
  const [clientes, servicios, cuentas, proveedores] = await Promise.all([
    getCustomers(),
    getServicesAdmin(),
    getAccountSlots(),
    getProviderOptions(),
  ]);

  return (
    <div>
      <PageHeader
        titulo="Nueva venta"
        descripcion="Te escribieron por WhatsApp. Elige el cliente y el servicio, y el panel te dice si ya tienes una plaza libre o a qué proveedor conviene comprarle."
      />
      <NuevaVenta
        clientes={clientes}
        servicios={servicios.filter((s) => s.activo)}
        cuentas={cuentas}
        proveedores={proveedores}
      />
    </div>
  );
}
