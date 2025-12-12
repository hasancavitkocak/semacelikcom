// Simple authentication helper for testing
export const simpleAuth = {
  register(email: string, password: string, fullName: string, phone?: string) {
    // This is a placeholder - actual implementation should use Supabase
    return {
      id: '1',
      email,
      fullName,
      phone
    }
  },
  setCurrentUser(user: any) {
    // Placeholder
    console.log('User set:', user)
  }
}
