/* eslint-disable @typescript-eslint/no-unused-vars */
import { Edit, Trash2, Building2 } from "lucide-react"
import type { BusinessClient } from "../../types/client"
import LoadingSpinner from "./loading-spinner"

interface BusinessClientsTableProps {
  clients: BusinessClient[]
  loading: boolean
  onEdit: (client: BusinessClient) => void
  onDelete: (id: string) => void
}

export default function BusinessClientsTable({ clients, loading, onEdit, onDelete }: BusinessClientsTableProps) {
  const getAccountTypeBadge = (type: string) => {
    return "px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
  }

  const getCompanyInitials = (companyName: string) => {
    return companyName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const handleEditClick = (client: BusinessClient) => {
    //console.log("Edit clicked for business client:", client)
    onEdit(client)
  }

  const handleDeleteClick = (id: string) => {
    onDelete(id)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
        <p className="text-gray-600">Commencez par ajouter votre première entreprise</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raison Sociale
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.idcltbusiness} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4">
                      {getCompanyInitials(client.raisoncltbusiness)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.raisoncltbusiness}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-blue-600 hover:underline">
                      <a href={`mailto:${client.emailcltbusiness}`}>{client.emailcltbusiness}</a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-500">{client.telcltbusiness}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-900">{client.villecltbusiness}</div>
                    <div className="text-sm text-gray-500">{client.payscltbusiness}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(client)}
                      className="p-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Modifier"
                      type="button"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(client.idcltbusiness)}
                      className="p-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Supprimer"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
