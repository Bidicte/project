/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrowUpDown } from "lucide-react"
import type { Room } from "../../types/pieceLouee/room"
import { Dropdown } from "./dropdown"
import { useEffect, useState } from "react"
import { apiService } from "../../services/pieceLouee/apiPieceLouee"


interface RoomTableProps {
  rooms: Room[]
  onEditRoom: (room: Room) => void
  onDeleteRoom: (pieceid: string) => void
  typepieceid:string
}

export function RoomTable({ rooms, onEditRoom, onDeleteRoom, typepieceid }: RoomTableProps) {
    const [roomsList, setRoomsList] = useState<Room[]>(rooms || [])

  useEffect(() => {
    const loadDetails = async () => {
       try {
            const response = await apiService.getRooms(typepieceid)
            if (response.success) {
              setRoomsList(response.data)
            } else {
              console.log("Erreur lors du chargement des pièces")
            }
          } catch (err) {
          //   const errorMessage = err instanceof Error ? err.message : "Erreur de connexion au serveur"
          //   setError(errorMessage)
          //   console.error("Error fetching rooms:", err)
          // } finally {
          //   setLoading(false)
          }
        }
    loadDetails()
  }, [typepieceid])

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-lg font-medium mb-2">Aucune pièce</div>
        <div className="text-sm">Cliquez sur le bouton + pour ajouter une pièce</div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Version desktop */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  N°
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  Code
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  Libellé
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  État
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-sm font-medium text-gray-700">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roomsList.map((room, index) => (
              <tr key={room.pieceid} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{room.piececode}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{room.piecelibelle}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      room.fonctionnel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {room.fonctionnel ? "Fonctionnel" : "Hors service"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Dropdown
                    items={[
                      { label: "Modifier", onClick: () => onEditRoom(room) },
                      {
                        label: "Supprimer",
                        onClick: () => onDeleteRoom(room.pieceid),
                        className: "text-red-600",
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Version mobile */}
      <div className="md:hidden">
        {rooms.map((room, index) => (
          <div key={room.pieceid} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm font-semibold text-gray-900">{room.piececode}</span>
              </div>
              <Dropdown
                items={[
                  { label: "Modifier", onClick: () => onEditRoom(room) },
                  {
                    label: "Supprimer",
                    onClick: () => onDeleteRoom(room.pieceid),
                    className: "text-red-600",
                  },
                ]}
              />
            </div>
            <p className="text-sm text-gray-600 mb-2">{room.piecelibelle}</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                room.fonctionnel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {room.fonctionnel ? "Fonctionnel" : "Hors service"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
