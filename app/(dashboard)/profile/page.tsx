'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, Key } from 'lucide-react'

interface Profile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  preferredUnits: string
  emailNotifications: boolean
  marketingEmails: boolean
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredUnits: 'imperial',
    emailNotifications: true,
    marketingEmails: false,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (response.ok) {
        setProfile(data.data)
        setFormData({
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          preferredUnits: data.data.preferredUnits,
          emailNotifications: data.data.emailNotifications,
          marketingEmails: data.data.marketingEmails,
        })
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.data)
        setSuccess('Profile updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    setChangingPassword(true)

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordSuccess('Password changed successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => setPasswordSuccess(''), 3000)
      } else {
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch (err) {
      setPasswordError('An error occurred')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center py-16 text-destructive">Failed to load profile</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Personal Information */}
      <form onSubmit={handleUpdateProfile}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">Preferred Units</Label>
              <Select
                value={formData.preferredUnits}
                onValueChange={(value) => setFormData({ ...formData, preferredUnits: value })}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperial">Imperial (oz, lb, cups)</SelectItem>
                  <SelectItem value="metric">Metric (g, kg, ml)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label>Notification Preferences</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, emailNotifications: checked as boolean })
                  }
                  disabled={saving}
                />
                <Label htmlFor="emailNotifications" className="text-sm font-normal cursor-pointer">
                  Weekly plan reminder emails
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketingEmails"
                  checked={formData.marketingEmails}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, marketingEmails: checked as boolean })
                  }
                  disabled={saving}
                />
                <Label htmlFor="marketingEmails" className="text-sm font-normal cursor-pointer">
                  Marketing and promotional emails
                </Label>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passwordError && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                disabled={changingPassword}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                disabled={changingPassword}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                disabled={changingPassword}
                required
              />
            </div>

            <Button type="submit" disabled={changingPassword} className="w-full">
              <Key className="mr-2 h-4 w-4" />
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
