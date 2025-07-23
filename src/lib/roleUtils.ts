import { supabase } from './supabase'

/**
 * Get user's role from the database
 * @param {string} userId - User ID from auth.users
 * @returns {Promise<string|null>} User's role or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    if (!userId) return null

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user role:', error)
      return 'user' // Default role
    }

    // If no role found, create a default role and return 'user'
    if (!data) {
      console.log(`No role found for user ${userId}, creating default role`)
      await createDefaultUserRole(userId)
      return 'user'
    }

    return data.role
  } catch (error) {
    console.error('Unexpected error fetching user role:', error)
    return 'user'
  }
}

/**
 * Check if user is admin
 * @param {string} userId - User ID from auth.users
 * @returns {Promise<boolean>} True if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin'
}

/**
 * Create default user role when user signs up
 * @param {string} userId - User ID from auth.users
 * @returns {Promise<boolean>} Success status
 */
export async function createDefaultUserRole(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert([
        { user_id: userId, role: 'user' }
      ])

    if (error) {
      console.error('Error creating default user role:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error creating user role:', error)
    return false
  }
}

/**
 * Update user's role (admin only)
 * @param {string} targetUserId - ID of user whose role to change
 * @param {string} newRole - New role to assign
 * @param {string} adminUserId - ID of admin making the change
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'user', adminUserId: string): Promise<boolean> {
  try {
    // First verify the person making the change is admin
    const isAdminUser = await isAdmin(adminUserId)
    if (!isAdminUser) {
      console.error('Only admins can update user roles')
      return false
    }

    const { error } = await supabase
      .from('user_roles')
      .upsert([
        { 
          user_id: targetUserId, 
          role: newRole,
          assigned_by: adminUserId,
          updated_at: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Error updating user role:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error updating user role:', error)
    return false
  }
}

/**
 * Get all users with their roles (admin only)
 * @param {string} adminUserId - ID of admin requesting the data
 * @returns {Promise<Array|null>} Array of users with roles or null
 */
export async function getAllUsersWithRoles(adminUserId: string): Promise<any[] | null> {
  try {
    // Verify admin access
    const isAdminUser = await isAdmin(adminUserId)
    if (!isAdminUser) {
      console.error('Only admins can view all users')
      return null
    }

    // Call the SQL function to get users with profiles
    const { data, error } = await supabase
      .rpc('get_users_with_roles')

    if (error) {
      console.error('Error fetching users with roles:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching users:', error)
    return null
  }
} 

 