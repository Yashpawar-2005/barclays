import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../../services/auth.service"

const SignupPage=()=> {
  const {signup}=useUserStore();
  const [showPassword, setShowPassword] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router=useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  // Handle input changes
  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setError("");
  };
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
  
    try {
      await signup(formData)
    //  const res=await axios.get('http://localhost:4000/satyam')
      console.log("res");
      router("/")
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return ( <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div
        className={cn(
          "w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-500",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Card className="border-0 shadow-none h-full">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-blue-600">Create an Account</CardTitle>
                <CardDescription>Enter your details to create your account</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                {/* Show error message if any */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="pl-10 transition-all duration-300 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MailIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="pl-10 transition-all duration-300 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <LockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pl-10 transition-all duration-300 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 transition-opacity duration-200 hover:opacity-70"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Signing Up..." : "Sign Up"}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="px-0 flex flex-col space-y-4">
                <p className="text-sm text-center text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:underline transition-colors duration-200">
                    Login
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="hidden md:block bg-blue-50 overflow-hidden">
            <div className="relative h-full w-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/30"></div>
              <img
                src="/images/logo.jpg"
                alt="Authentication"
                className="w-60 h-60 rounded-full object-cover border-4 border-white shadow-md relative z-10"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white backdrop-blur-sm bg-blue-900/30">
                <h3 className="text-xl font-bold">Secure Authentication</h3>
                <p className="mt-2 text-sm text-blue-50">
                  Your data is protected with industry-standard encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage