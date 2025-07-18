import { Edit, Trash2, Users } from "lucide-react"
import type { RegularClient } from "../../types/client"
import LoadingSpinner from "./loading-spinner"

interface RegularClientsTableProps {
  clients: RegularClient[]
  loading: boolean
  onEdit: (client: RegularClient) => void
  onDelete: (id: string) => void
}

export default function RegularClientsTable({ clients, loading, onEdit, onDelete }: RegularClientsTableProps) {

  const handleEditClick = (client: RegularClient) => {
    // console.log("Edit clicked for client:", client)
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
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
        <p className="text-gray-600">Commencez par ajouter votre premier client régulier</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom & Prénom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.idcltreg} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-4">
                      {client.nomcltreg.charAt(0)}
                      {client.prenomcltreg.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.nomcltreg} {client.prenomcltreg}
                      </div>
                      {/* <div className="text-sm text-gray-500">ID: {client.idcltreg.slice(0, 8)}...</div> */}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-blue-600 hover:underline">
                      <a href={`mailto:${client.emailcltreg}`}>{client.emailcltreg}</a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm ">{client.telcltreg}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-500">{client.payscltreg}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-900">{client.villecltreg}</div>
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
                      onClick={() => handleDeleteClick(client.idcltreg)}
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
