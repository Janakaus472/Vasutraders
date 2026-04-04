// Admin is open — no auth required
export function useAdminGuard() {
  return { isLoading: false, isAdmin: true }
}
