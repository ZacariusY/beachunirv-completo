import AuthExample from '@/components/auth-example'

export default function TestePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Teste de Autenticação - BeachUnirv
        </h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Esta página testa o sistema de autenticação com localStorage.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Backend deve estar rodando em: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3001</code>
          </p>
        </div>

        <AuthExample />
      </div>
    </div>
  )
} 