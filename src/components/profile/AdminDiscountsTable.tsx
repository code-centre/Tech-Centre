import { TrashIcon } from 'lucide-react'
import React from 'react'

interface Props {
	filteredDiscounts: any[]
	handleDisable: (id: string) => void
	handleEnable: (id: string) => void
	handleDelete: (id: string) => void
	getProductTitle: (productId: string) => string
}

export default function AdminDiscountsTable({
	filteredDiscounts,
	handleDisable,
	handleEnable,
	handleDelete,
	getProductTitle,
}: Props) {
	return (
		<table className="min-w-full divide-ym divide-gray-200">
			<thead className="bg-gray-50 text-center">
				<tr className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
					<th className="px-6 py-3.5">
						Nombre
					</th>
					<th className="px-6 py-3.5">
						Código
					</th>
					<th className="px-6 py-3.5">
						Descuento
					</th>
					<th className="px-6 py-3.5">
						Producto
					</th>
					<th className="px-6 py-3.5">
						Veces redimido
					</th>
					<th className="px-6 py-3.5">
						Fecha de creación
					</th>
					<th className="px-6 py-3.5">
						Acciones
					</th>
				</tr>
			</thead>
			<tbody className="bg-white divide-y divide-gray-200">
				{filteredDiscounts.map((items: any) => (
					<tr key={items.id} className="hover:bg-gray-50 transition-colors duration-200 text-center">
						<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
							{items.name}
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
							{items.code}
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{items.discount}%
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{getProductTitle(items.productId)}
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{items.timesUsed}
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{items.createdAt?.toLocaleString('es-ES', { dateStyle: 'short' }) || 'N/A'}
						</td>
						<td className="px-6 py-5 whitespace-nowrap text-sm space-x-2">
							<div className="flex items-center gap-2 w-full">
								{items.disable === false ?
									<button
										onClick={() => handleDisable(items.id)}
										className="inline-flex w-7/12 items-center justify-center px-6 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
									>
										Deshabilitar
									</button>
									: <button
										onClick={() => handleEnable(items.id)}
										className="inline-flex w-7/12 items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
									>
										Habilitar
									</button>}
								<button
									onClick={() => handleDelete(items.id)}
									className="inline-flex items-center justify-center h-[30px] aspect-square border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
								>
									<TrashIcon className="w-4 h-4" />
								</button>
							</div>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
