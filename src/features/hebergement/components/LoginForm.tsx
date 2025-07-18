/* eslint-disable @typescript-eslint/no-unused-vars */
// components/LoginForm.tsx
import React, { useState } from 'react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { authService } from '../services/authService';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!credentials.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!credentials.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (credentials.password.length < 3) {
      newErrors.password = 'Le mot de passe doit contenir au moins 3 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setApiError('');
    setErrors({});
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // SOLUTION : Utiliser directement authService au lieu du contexte
      // pour éviter les interférences avec le state du contexte
      await authService.login(credentials);
      // Maintenant, mettre à jour le contexte seulement après succès
      // En récupérant l'utilisateur depuis le storage
      const authenticatedUser = authService.getUser();
      if (authenticatedUser) {
        // Force un refresh de la page ou navigation
        window.location.reload();
      }
      
    } catch (error) {
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Maintenant l'erreur devrait s'afficher car aucun re-render du contexte
      setApiError(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Effacer les erreurs de validation
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Effacer l'erreur API seulement quand l'utilisateur clique sur le bouton X
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const clearApiError = () => {
    setApiError('');
  };



  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Côté gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
          {/* En-tête */}
          <div className="text-center mb-8 flex justify-center items-center space-x-2">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <span className='text-white font-bold text-2xl'>C</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">CHK-PMS</h1>
            </div>
          </div>

          {/* Carte du formulaire */}
          <div className="bg-white rounded-xl shadow-lg p-12 min-h-[500px]">
            <div className="mb-6">
              <div className="flex justify-center items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Connectez-vous</h2>
              </div>
            </div>


            {/* Affichage des erreurs API */}
            {apiError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur de connexion
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {apiError}
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      type="button"
                      onClick={clearApiError}
                      className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    >
                      <span className="sr-only">Fermer</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Champ nom d'utilisateur */}
              <div>
                <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={credentials.username}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.username 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Entrez votre nom d'utilisateur"
                    autoComplete="username"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Champ mot de passe */}
              <div>
                <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Options de connexion */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={credentials.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 font-medium">
                    Se souvenir de moi
                  </label>
                </div>

                {/* <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    Mot de passe oublié ?
                  </button>
                </div> */}
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white text-lg py-4 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Côté droit - Image */}
      <div className="hidden lg:flex flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="Hôtel de luxe"
            className="w-full h-full object-cover mix-blend-overlay"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <h2 className="text-4xl font-bold mb-4">Bienvenue dans CHK-PMS</h2>
              <p className="text-xl opacity-90 mb-6">
                Votre système de gestion hôtelière moderne et efficace
              </p>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm opacity-75">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm opacity-75">Sécurisé</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">∞</div>
                  <div className="text-sm opacity-75">Possibilités</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal mot de passe oublié */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};