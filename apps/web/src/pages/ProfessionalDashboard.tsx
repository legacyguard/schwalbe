/**
 * Professional Dashboard - Complete Professional Portal
 * Replaces empty ProfessionalDemoApp.tsx with full functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Eye,
  FileText,
  MessageSquare,
  Shield,
  Star,
  TrendingUp,
  User,
  Users,
  Zap,
  AlertCircle,
  CheckCircle,
  Download,
  Filter,
  Search,
  Settings,
  XCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabaseClient as supabase } from '@schwalbe/shared/src/supabase/client';
import { logger } from '@schwalbe/shared/src/lib/logger';

// Professional interfaces
interface ProfessionalProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  profession: 'lawyer' | 'notary' | 'financial_advisor' | 'estate_planner';
  specializations: string[];
  languages: string[];
  jurisdiction: string;
  license_number: string;
  years_experience: number;
  hourly_rate: number;
  availability_status: 'available' | 'busy' | 'offline';
  trust_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  rating: number;
  reviews_count: number;
  completed_reviews: number;
  bio: string;
  profile_image_url?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface ReviewRequest {
  id: string;
  client_user_id: string;
  professional_id: string;
  document_type: string;
  document_category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_review' | 'completed' | 'revision_requested' | 'rejected';
  title: string;
  description: string;
  estimated_hours: number;
  agreed_rate: number;
  client_budget?: number;
  deadline?: string;
  client_notes?: string;
  professional_notes?: string;
  documents_url?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: {
    name: string;
    email: string;
  };
}

interface TrustSeal {
  id: string;
  professional_id: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  issued_at: string;
  expires_at: string;
  criteria_met: {
    reviews_count: number;
    rating_average: number;
    completion_rate: number;
    response_time: number;
    certifications: string[];
  };
}

interface Commission {
  id: string;
  professional_id: string;
  review_request_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'disputed';
  payment_method: string;
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
}

export default function ProfessionalDashboard() {
  const { t } = useTranslation();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Professional data
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [trustSeal, setTrustSeal] = useState<TrustSeal | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  // UI state
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load professional data
  useEffect(() => {
    loadProfessionalData();
  }, []);

  const loadProfessionalData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Load professional profile
      const { data: profileData, error: profileError } = await supabase
        .from('professional_reviewers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (!profileData) {
        // Not a professional user
        setError('Professional account not found');
        return;
      }

      setProfile(profileData);

      // Load review requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('review_requests')
        .select(`
          *,
          client:auth.users!review_requests_client_user_id_fkey(
            email,
            raw_user_meta_data
          )
        `)
        .eq('professional_id', profileData.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setReviewRequests(requestsData || []);

      // Load trust seal
      const { data: sealData } = await supabase
        .from('trust_seals')
        .select('*')
        .eq('professional_id', profileData.id)
        .order('issued_at', { ascending: false })
        .limit(1)
        .single();

      setTrustSeal(sealData);

      // Load commissions
      const { data: commissionsData } = await supabase
        .from('professional_commissions')
        .select('*')
        .eq('professional_id', profileData.id)
        .order('created_at', { ascending: false });

      setCommissions(commissionsData || []);

      logger.info('Loaded professional data', {
        metadata: {
          profileId: profileData.id,
          requestsCount: requestsData?.length || 0,
          commissionsCount: commissionsData?.length || 0
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load professional data';
      setError(errorMessage);
      logger.error('Failed to load professional data', { metadata: { error: errorMessage } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('review_requests')
        .update({
          status: 'in_review',
          professional_notes: 'Review accepted and started'
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setReviewRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'in_review' as const }
            : req
        )
      );

      logger.info('Accepted review request', { metadata: { requestId } });
    } catch (err) {
      logger.error('Failed to accept request', { metadata: { error: err instanceof Error ? err.message : String(err) } });
    }
  };

  const handleCompleteRequest = async (requestId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('review_requests')
        .update({
          status: 'completed',
          professional_notes: notes
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setReviewRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'completed' as const, professional_notes: notes }
            : req
        )
      );

      // Create commission entry
      const request = reviewRequests.find(r => r.id === requestId);
      if (request && profile) {
        const { error: commissionError } = await supabase
          .from('professional_commissions')
          .insert({
            professional_id: profile.id,
            review_request_id: requestId,
            amount: request.agreed_rate * request.estimated_hours,
            currency: 'EUR',
            status: 'pending'
          });

        if (commissionError) {
          logger.error('Failed to create commission', { metadata: { error: commissionError.message } });
        }
      }

      logger.info('Completed review request', { metadata: { requestId } });
    } catch (err) {
      logger.error('Failed to complete request', { metadata: { error: err instanceof Error ? err.message : String(err) } });
    }
  };

  const getStatusColor = (status: ReviewRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ReviewRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrustSealIcon = (level: TrustSeal['level']) => {
    switch (level) {
      case 'platinum':
        return <Star className="w-5 h-5 text-purple-600" />;
      case 'gold':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'silver':
        return <Star className="w-5 h-5 text-gray-600" />;
      case 'bronze':
        return <Star className="w-5 h-5 text-orange-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  // Filter requests based on status and search
  const filteredRequests = reviewRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Calculate dashboard metrics
  const totalRequests = reviewRequests.length;
  const pendingRequests = reviewRequests.filter(r => r.status === 'pending').length;
  const completedRequests = reviewRequests.filter(r => r.status === 'completed').length;
  const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);
  const averageRating = profile?.rating || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Načítavam profesionálny dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-red-500 text-4xl">⚠️</div>
            <h3 className="font-semibold">Chyba pri načítaní</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={loadProfessionalData} variant="outline">
              Skúsiť znovu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Profesionálny Dashboard
            </h1>
            <p className="text-gray-600">
              Vitajte späť, {profile?.name || 'Professional'}
            </p>
          </div>

          {/* Trust Seal */}
          {trustSeal && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border shadow-sm">
              {getTrustSealIcon(trustSeal.level)}
              <span className="font-medium capitalize">{trustSeal.level} Trust Seal</span>
            </div>
          )}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Celkové žiadosti</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Čakajúce žiadosti</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingRequests}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dokončené</p>
                  <p className="text-2xl font-bold text-green-600">{completedRequests}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Celkové výnosy</p>
                  <p className="text-2xl font-bold text-purple-600">€{totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="requests">Žiadosti</TabsTrigger>
            <TabsTrigger value="commissions">Provízie</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Najnovšie žiadosti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviewRequests.slice(0, 5).map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-gray-600">{request.client?.name}</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Výkonnostné štatistiky</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Hodnotenie</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Dokončených recenzií</span>
                      <span className="font-medium">{profile?.completed_reviews || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Roky skúseností</span>
                      <span className="font-medium">{profile?.years_experience || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Hľadať žiadosti..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Všetky stavy</SelectItem>
                      <SelectItem value="pending">Čakajúce</SelectItem>
                      <SelectItem value="in_review">V recenzii</SelectItem>
                      <SelectItem value="completed">Dokončené</SelectItem>
                      <SelectItem value="revision_requested">Potreba revízie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <div className="grid gap-4">
              {filteredRequests.map(request => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.title}</h3>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{request.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Klient: {request.client?.name}</span>
                          <span>Typ: {request.document_type}</span>
                          <span>Sadzba: €{request.agreed_rate}/hod</span>
                          <span>Odhad: {request.estimated_hours}h</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.status === 'pending' && (
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            size="sm"
                          >
                            Prijať
                          </Button>
                        )}
                        {request.status === 'in_review' && (
                          <Button
                            onClick={() => handleCompleteRequest(request.id, 'Review completed successfully')}
                            size="sm"
                            variant="outline"
                          >
                            Dokončiť
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>História provízie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.map(commission => (
                    <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Provízia #{commission.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(commission.created_at).toLocaleDateString('sk-SK')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{commission.amount.toFixed(2)}</p>
                        <Badge className={
                          commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                          commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>Profesionálny profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Meno</label>
                        <p className="mt-1 text-gray-900">{profile.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-gray-900">{profile.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Spoločnosť</label>
                        <p className="mt-1 text-gray-900">{profile.company}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Profesia</label>
                        <p className="mt-1 text-gray-900 capitalize">{profile.profession}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Jurisdikcia</label>
                        <p className="mt-1 text-gray-900">{profile.jurisdiction}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Licenčné číslo</label>
                        <p className="mt-1 text-gray-900">{profile.license_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Hodinová sadzba</label>
                        <p className="mt-1 text-gray-900">€{profile.hourly_rate}/hod</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Roky skúseností</label>
                        <p className="mt-1 text-gray-900">{profile.years_experience} rokov</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Životopis</label>
                    <p className="mt-1 text-gray-900">{profile.bio}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Špecializácie</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Jazyky</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.languages.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}