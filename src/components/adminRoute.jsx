// AdminRoute.jsx
import { UserAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { session, loading } = UserAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  const isAdmin = session?.user?.user_metadata?.admin === true;

  if (!isAdmin) {
    // Redirect non-admin users to student dashboard
    return <Navigate to="/dash" replace />;
  }

  // Render the admin component if user is authenticated admin
  console.log("Admin route accessed by:", session.user.email);
  return <>{children}</>;
};

export default AdminRoute;
