import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Button, Input, Select } from '../components/atoms'
import authService from '../services/authService'
import { Train, Check, X } from 'lucide-react'

const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string().required('Role is required'),
})

const roleOptions = [
  { value: 'inspector', label: 'Inspector' },
  { value: 'depot_officer', label: 'Depot Officer' },
  { value: 'zonal_manager', label: 'Zonal Manager' },
  { value: 'admin', label: 'Administrator' },
]

const RegisterPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  })

  const password = watch('password', '')

  // Password strength indicator
  const getPasswordStrength = pwd => {
    if (!pwd) return { strength: 0, label: '', color: '' }

    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' }
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' }
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-blue-500' }
    return { strength, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async data => {
    try {
      setLoading(true)
      const { passwordConfirm, ...userData } = data
      await authService.register(userData)
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      if (error.message?.includes('duplicate') || error.message?.includes('exists')) {
        toast.error('Email already registered. Please use a different email.')
      } else {
        toast.error(error.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-ir-blue rounded-full mb-4">
          <Train className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Join RailTrack AI System</p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register('name')}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password')}
            required
          />

          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password strength:</span>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength.strength <= 2
                      ? 'text-red-600'
                      : passwordStrength.strength <= 3
                        ? 'text-yellow-600'
                        : passwordStrength.strength <= 4
                          ? 'text-blue-600'
                          : 'text-green-600'
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          error={errors.passwordConfirm?.message}
          {...register('passwordConfirm')}
          required
        />

        <Select
          label="Role"
          options={roleOptions}
          placeholder="Select your role"
          error={errors.role?.message}
          {...register('role')}
          required
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      {/* Login Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-ir-blue hover:text-blue-700 transition-colors"
        >
          Sign in here
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
