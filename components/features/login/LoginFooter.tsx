'use client';

export default function LoginFooter() {
  return (
    <div className="mt-6 text-center">
      <p className="text-gray-600">
        Não tem uma conta?{' '}
        <a 
          href="#" 
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          Cadastre-se
        </a>
      </p>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Ao continuar, você concorda com nossos{' '}
          <a href="#" className="text-gray-700 hover:text-gray-900 underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="#" className="text-gray-700 hover:text-gray-900 underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
}
