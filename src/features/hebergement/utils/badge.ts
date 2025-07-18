export const getAccountTypeBadge = (type: string) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
  if (type === "Premium" || type === "VIP") {
    return `${baseClasses} bg-blue-100 text-blue-800`
  }
  return `${baseClasses} bg-gray-100 text-gray-800`
}
