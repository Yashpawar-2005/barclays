
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { useUserStore } from "../../services/auth.service"
export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { login } = useUserStore()
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  
  const handleChange = (e:any) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
    
    // Clear error when user types
    if (error) setError("")
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
    setIsSubmitting(true);
    setError("");
  
    try {

      await login(formData)
      // console.log("Login successful:", response.data);
      // navigate("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    }finally{
      setIsSubmitting(false)
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
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
                <CardTitle className="text-2xl font-bold text-blue-600">Welcome Back</CardTitle>
                <CardDescription>Login to your account</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Your username"
                          className="pl-10 transition-all duration-300 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-500">
                          Remember me
                        </Label>
                      </div>
                      <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline transition-colors duration-200">
                        Forgot password?
                      </Link>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="px-0 flex flex-col space-y-4">
                <p className="text-sm text-center text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 hover:underline transition-colors duration-200">
                    Sign Up
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="hidden md:block bg-blue-50 overflow-hidden">
            <div className="relative h-full w-full flex items-center justify-center">
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/30 animate-pulse"
                style={{ animationDuration: '8s' }}
              ></div>
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