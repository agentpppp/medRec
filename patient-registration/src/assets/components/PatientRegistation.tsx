import React, { useState } from "react";
import { registation } from '../databseutil/Database';
import { useNavigate } from "react-router-dom";

interface FormData {
  name: string;
  email: string;
  age: string;
  phone: string;
  gender: string;
  address: string;
  emergencyContact: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  age?: string;
  phone?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  age: "",
  phone: "",
  gender: "",
  address: "",
  emergencyContact: ""
};

const PatientForm = () => {
  const navigate=useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateField = (field: keyof FormData, value: string): boolean => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          newErrors.name = "Name contains invalid characters";
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case 'age':
        if (!value) {
          newErrors.age = "Age is required";
        } else {
          const ageNum = parseInt(value);
          if (isNaN(ageNum)) {
            newErrors.age = "Age must be a number";
          } else if (ageNum < 0 || ageNum > 120) {
            newErrors.age = "Age must be between 0 and 120";
          } else {
            delete newErrors.age;
          }
        }
        break;

      case 'phone':
        if (!value) {
          newErrors.phone = "Phone number is required";
        } else if (!/^[\d\s+-]+$/.test(value)) {
          newErrors.phone = "Phone number contains invalid characters";
        } else if (value.replace(/\D/g, '').length < 7) {
          newErrors.phone = "Phone number must be at least 7 digits";
        } else {
          delete newErrors.phone;
        }
        break;

      case 'gender':
        if (!value) {
          newErrors.gender = "Gender is required";
        } else {
          delete newErrors.gender;
        }
        break;

      case 'emergencyContact':
        if (!value) {
          newErrors.emergencyContact = "Emergency contact is required";
        } else if (!/^[\d\s+-]+$/.test(value)) {
          newErrors.emergencyContact = "Contains invalid characters";
        } else if (value.replace(/\D/g, '').length < 7) {
          newErrors.emergencyContact = "Must be at least 7 digits";
        } else {
          delete newErrors.emergencyContact;
        }
        break;

      case 'address':
        if (!value.trim()) {
          newErrors.address = "Address is required";
        } else if (value.trim().length < 10) {
          newErrors.address = "Address is too short";
        } else {
          delete newErrors.address;
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const validateForm = (): boolean => {
    let isValid = true;
    (Object.keys(formData) as (keyof FormData)[]).forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let sanitizedValue = value;
    if (name === 'name') {
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    } else if (name === 'age') {
      sanitizedValue = value.replace(/\D/g, '');
    } else if (name === 'phone' || name === 'emergencyContact') {
      sanitizedValue = value.replace(/[^\d\s+-]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    validateField(name as keyof FormData, sanitizedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      await registation(formData);
      setSubmitSuccess(true);
      setFormData(initialFormData);
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Registration error:', err);
      setServerError('Failed to register patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Patient Registration Form</h2>
        
        {submitSuccess && (
          <div className="p-3 bg-green-100 text-green-800 rounded-lg mb-6 text-center">
            Patient registered successfully!
          </div>
        )}
        
        {serverError && (
          <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-6 text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Column */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.name ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-300'
                }`}
                maxLength={50}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.email ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-300'
                }`}
                maxLength={100}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="text"
                name="age"
                id="age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.age ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-300'
                }`}
                maxLength={3}
              />
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.gender ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-300'
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>
          </div>

          {/* Contact Information Column */}
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.phone ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-300'
                }`}
                maxLength={20}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact *
              </label>
              <input
                type="tel"
                name="emergencyContact"
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.emergencyContact ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-300'
                }`}
                maxLength={20}
              />
              {errors.emergencyContact && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.address ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-300'
                }`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 flex justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Form
            </button>
            <button
              type="button"
              onClick={() => navigate("/registerd-Patient")}
              className="px-6 py-2 bg-green-500 text-gray-800 rounded-lg hover:bg-green-800 transition-colors"
            >
              Patient Detail
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submiting.
                </>
              ) : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;