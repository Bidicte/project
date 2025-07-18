/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback } from "react"
import { Search, Plus } from "lucide-react"
import type { RegularClient, BusinessClient } from "../types/client"
import { useRegularClients } from "../hooks/clients/use-regular-clients"
import { useBusinessClients } from "../hooks/clients/use-business-clients"
import RegularClientsTable from "../components/clients/regular-clients-table"
import BusinessClientsTable from "../components/clients/business-clients-table"
import RegularClientFormModal from "../components/clients/regular-client-form-modal"
import BusinessClientFormModal from "../components/clients/business-client-form-modal"
import DeleteConfirmationModal from "../components/clients/delete-client-modal"
import ErrorMessage from "../components/clients/error-message"
import Notification from "../components/clients/notification"

export type { RegularClient, BusinessClient } from "../types/client"

export default function Clients() {
  const [activeTab, setActiveTab] = useState("reguliers")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRegularFormOpen, setIsRegularFormOpen] = useState(false)
  const [isBusinessFormOpen, setIsBusinessFormOpen] = useState(false)
  const [selectedBusinessClient, setSelectedBusinessClient] = useState<BusinessClient | null>(null)
  const [selectedRegularClient, setSelectedRegularClient] = useState<RegularClient | null>(null)
  const [isDeleteRegularModalOpen, setIsDeleteRegularModalOpen] = useState(false)
  const [isDeleteBusinessModalOpen, setIsDeleteBusinessModalOpen] = useState(false)
 const [businessClientToDelete, setBusinessClientToDelete] = useState<string | null>(null)
  const [regularClientToDelete, setRegularClientToDelete] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const {
    clients: regularClients,
    loading: regularLoading,
    error: regularError,
    createClient: createRegularClient,
    updateClient: updateRegularClient,
    deleteClient: deleteRegularClient,
    refresh: refreshRegular,
  } = useRegularClients()

  const {
    clients: businessClients,
    loading: businessLoading,
    error: businessError,
    createClient: createBusinessClient,
    updateClient: updateBusinessClient,
    deleteClient: deleteBusinessClient,
    refresh: refreshBusiness,
  } = useBusinessClients()

  // Recherche locale (filtrage en mémoire)
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query)
  }, [])

  // Filtrage local selon la recherche
  const filteredRegularClients = regularClients.filter((client) =>
    client.nomcltreg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.prenomcltreg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.emailcltreg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.villecltreg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.payscltreg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telcltreg.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredBusinessClients = businessClients.filter((client) =>
    client.numcomptcltbusiness.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.raisoncltbusiness.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.payscltbusiness.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.emailcltbusiness.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.villecltbusiness.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telcltbusiness.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveRegularClient = useCallback(
    async (client: RegularClient | Omit<RegularClient, "idcltreg">) => {
      try {
        if ('idcltreg' in client) {
          // Mode édition
          await updateRegularClient(client.idcltreg, client)
          setNotification({ type: "success", message: "Client régulier modifié avec succès" })
        } else {
          // Mode ajout
          await createRegularClient(client)
          setNotification({ type: "success", message: "Client régulier ajouté avec succès" })
        }
        setIsRegularFormOpen(false)
        setSelectedRegularClient(null)
      } catch {
        setNotification({ type: "error", message: "Erreur lors de la sauvegarde du client" })
      }
    },
    [createRegularClient, updateRegularClient]
  )

  const handleSaveBusinessClient = useCallback(
    async (client: BusinessClient | Omit<BusinessClient, "idcltbusiness">) => {
      try {
        if ('idcltbusiness' in client) {
          // Mode édition
          await updateBusinessClient(client.idcltbusiness, client)
          setNotification({ type: "success", message: "Client business modifié avec succès" })
        } else {
          // Mode ajout
          await createBusinessClient(client)
          setNotification({ type: "success", message: "Client business ajouté avec succès" })
        }
        setIsBusinessFormOpen(false)
        setSelectedBusinessClient(null)
      } catch {
        setNotification({ type: "error", message: "Erreur lors de la sauvegarde du client" })
      }
    },
    [createBusinessClient, updateBusinessClient]
  )


  
  const handleDeleteRegularClient = useCallback(
    async (id: string) => {
      try {
        await deleteRegularClient(id)
        setNotification({ type: "success", message: "Client régulier supprimé avec succès" })
         setIsDeleteRegularModalOpen(false)
      } catch {
        setNotification({ type: "error", message: "Erreur lors de la suppression" })
      }
    },
    [deleteRegularClient]
  )

  const handleDeleteBusinessClient = useCallback(
    async (id: string) => {
      try {
        await deleteBusinessClient(id)
          setNotification({ type: "success", message: "Client business supprimé avec succès" })
         setIsDeleteBusinessModalOpen(false)
      } catch {
        setNotification({ type: "error", message: "Erreur lors de la suppression" })
      }
    },
    [deleteBusinessClient]
  )

  const openAddModal = () => {
    if (activeTab === "reguliers") {
      setIsRegularFormOpen(true)
    } else {
      setIsBusinessFormOpen(true)
    }
  }

  const openUpdateBusienssClientModal = (client: BusinessClient) => {
    setSelectedBusinessClient(client)
    setIsBusinessFormOpen(true)
  }

  const openUpdateRegularClientModal = (client: RegularClient) => {
    setSelectedRegularClient(client)
    setIsRegularFormOpen(true)
  }

  const openDeleteRegularClientModal = (id:string) => {
        setRegularClientToDelete(id)
    setIsDeleteRegularModalOpen(true)
  }
  const openDeleteBusinessClientModal = (id:string) => {
    setIsDeleteBusinessModalOpen(true)
    setBusinessClientToDelete(id)
  }
  const handleRefresh = () => {
    if (activeTab === "reguliers") {
      refreshRegular()
    } else {
      refreshBusiness()
    }
  }

  const currentError = activeTab === "reguliers" ? regularError : businessError
  const currentLoading = activeTab === "reguliers" ? regularLoading : businessLoading

  return (
    <div className="mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Gestion des clients</h1>
          <p className="text-gray-600">Gérez vos clients réguliers et business</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
          <button
            onClick={() => setActiveTab("reguliers")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "reguliers" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Clients réguliers ({regularClients.length})
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "business" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Clients business ({businessClients.length})
          </button>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un client"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      {currentError ? (
        <ErrorMessage message={currentError} onRetry={handleRefresh} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {activeTab === "reguliers" ? (
            <RegularClientsTable
              clients={filteredRegularClients}
              loading={regularLoading}
              onEdit={openUpdateRegularClientModal}
              onDelete={openDeleteRegularClientModal}
            />
          ) : (
            <BusinessClientsTable
              clients={filteredBusinessClients}
              loading={businessLoading}
              onEdit={openUpdateBusienssClientModal}
              onDelete={openDeleteBusinessClientModal}
            />
          )}
        </div>
      )}

      {/* Formulaires unifiés */}
      {isRegularFormOpen && (
        <RegularClientFormModal 
          client={selectedRegularClient ?? undefined}
          onClose={() => {
            setIsRegularFormOpen(false)
            setSelectedRegularClient(null)
          }} 
          onSave={handleSaveRegularClient} 
        />
      )}
      {isBusinessFormOpen && (
        <BusinessClientFormModal 
          client={selectedBusinessClient ?? undefined}
          onClose={() => {
            setIsBusinessFormOpen(false)
            setSelectedBusinessClient(null)
          }} 
          onSave={handleSaveBusinessClient} 
        />
      )}

      {isDeleteRegularModalOpen && (
        <DeleteConfirmationModal
          id={regularClientToDelete || ""}
          type="regular"
          isOpen={isDeleteRegularModalOpen}
          onClose={() => setIsDeleteRegularModalOpen(false)}
          onConfirm={handleDeleteRegularClient}
        />
      )}
      {isDeleteBusinessModalOpen && (
        <DeleteConfirmationModal
          id={businessClientToDelete || ""}
          type="business"
          isOpen={isDeleteBusinessModalOpen}
          onClose={() => setIsDeleteBusinessModalOpen(false)}
          onConfirm={handleDeleteBusinessClient}
        />
      )}
      {/* Notifications */}
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}
