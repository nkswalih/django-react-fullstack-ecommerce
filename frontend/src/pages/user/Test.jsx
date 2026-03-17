import { useState } from 'react'
import axios from 'axios'

const Test = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    terms: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.terms) {
      alert('Please accept the terms and conditions')
      return
    }

    try {
      // Check if user already exists
      const response = await axios.get('http://localhost:3001/users')
      const existingUser = response.data.find(user => user.email === formData.email)
      
      if (existingUser) {
        alert('User with this email already exists')
        return
      }

      // Register new user
      await axios.post('http://localhost:3001/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      alert('Registration successful! You can now login.')
      setFormData({
        name: '',
        email: '',
        password: '',
        terms: false
      })
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
    }
  }

  const isSubmitDisabled = !formData.name || !formData.email || !formData.password || !formData.terms

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Register</h2>
      
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
          />
          I accept the terms and conditions
        </label>
      </div>

      <button type="submit" disabled={isSubmitDisabled}>
        Register
      </button>
    </form>
  )
}

export default Test