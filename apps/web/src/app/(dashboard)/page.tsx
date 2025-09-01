"use client";

import { useAuth } from "@/providers/auth-provider";
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Skeleton,
  SkeletonText,
  Avatar,
  Badge,
  LoadingSpinner,
} from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { LogOut, User, Mail, Calendar, Shield, CheckCircle2, AlertTriangle } from "lucide-react";

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <SkeletonText lines={3} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <SkeletonText lines={4} />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  }, [signOut, router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const joinDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(user.createdAt);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                {userInitials}
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">Dashboard</h1>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your account and activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Status</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {user.emailVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Unverified</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{joinDate}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {user.name ? 'Complete' : 'Incomplete'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 bg-primary text-primary-foreground text-xl">
                  {userInitials}
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium">{user.name || 'No name set'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.emailVerified ? "default" : "secondary"}>
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated {new Intl.RelativeTimeFormat('en').format(-7, 'day')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Auth</p>
                    <p className="text-sm text-muted-foreground">
                      Not enabled
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
              
              {!user.emailVerified && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Email verification required
                      </p>
                      <p className="text-sm text-orange-700">
                        Please verify your email to access all features.
                      </p>
                      <Button size="sm" className="mt-2">
                        Resend verification
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;