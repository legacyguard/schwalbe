/**
 * Professional Service - Data Access Layer
 * Replaces hardcoded mock data with proper API integration
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@schwalbe/shared'
import { apiClient, handleApiResponse } from '@/lib/api-client'
import { errorHandler, NetworkError, ValidationError, ServerError } from '@/lib/error-handling'

export interface ProfessionalProfile {
  id: string
  userId: string
  email: string
  full_name: string
  fullName: string
  professional_title: string
  law_firm_name?: string
  bar_number?: string
  licensed_states?: string[]
  type: 'attorney' | 'financial_advisor' | 'notary'
  licenseNumber?: string
  jurisdiction?: string
  specializations?: Array<{
    id: string
    name: string
    category: string
  }>
  experience?: number
  experience_years?: number
  hourly_rate?: number
  verified: boolean
  status: 'active' | 'inactive' | 'pending'
  bio?: string
  website?: string
  phone?: string
  rating?: number
  reviews_count?: number
  response_time_hours?: number
  availability_status?: 'available' | 'busy' | 'away'
  created_at: string
  updated_at: string
  // Additional properties for the component
  achievements?: string[]
  availability: 'available' | 'busy' | 'unavailable'
  featuredReview?: {
    clientName: string
    comment: string
    date: string
    rating: number
  }
  languages?: string[]
  responseTime: string
  reviewCount: number
  services: Array<{
    description: string
    startingPrice: number
    type: 'consultation' | 'retainer' | 'review'
  }>
  trustScore?: number
  successRate?: number
  responseRate?: number
  profile_image_url?: string
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected'
}

export interface ProfessionalFilters {
  type?: string
  specialization?: string
  jurisdiction?: string
  minRating?: number
  maxHourlyRate?: number
  availability?: string
  verified?: boolean
}

export interface ProfessionalSearchResult {
  professionals: ProfessionalProfile[]
  totalCount: number
  hasMore: boolean
}

class ProfessionalService {
  /**
   * Fetch professionals with filtering and pagination
   */
  async getProfessionals(
    filters: ProfessionalFilters = {},
    page = 1,
    limit = 20
  ): Promise<ProfessionalSearchResult> {
    try {
      let query = supabase
        .from('professional_reviewers')
        .select(`
          id,
          user_id,
          email,
          full_name,
          professional_title,
          law_firm_name,
          bar_number,
          licensed_states,
          type,
          license_number,
          jurisdiction,
          specializations,
          experience_years,
          hourly_rate,
          verified,
          status,
          bio,
          website,
          phone,
          rating,
          reviews_count,
          response_time_hours,
          availability_status,
          created_at,
          updated_at
        `, { count: 'exact' })
        .eq('status', 'active')
        .eq('verified', true)

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.jurisdiction) {
        query = query.eq('jurisdiction', filters.jurisdiction)
      }

      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('rating', filters.minRating)
      }

      if (filters.maxHourlyRate && filters.maxHourlyRate > 0) {
        query = query.lte('hourly_rate', filters.maxHourlyRate)
      }

      if (filters.availability) {
        query = query.eq('availability_status', filters.availability)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .range(from, to)
        .order('rating', { ascending: false })
        .order('reviews_count', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        logger.error('Failed to fetch professionals', { metadata: { error } })
        throw error
      }

      // Transform data to match frontend interface
      const professionals: ProfessionalProfile[] = (data || []).map((prof: any) => ({
        ...prof,
        userId: prof.user_id,
        fullName: prof.full_name,
        licenseNumber: prof.license_number,
        experience: prof.experience_years
      }))

      return {
        professionals,
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1
      }

    } catch (error) {
      const handledError = errorHandler.handle(error as Error, {
        component: 'ProfessionalService',
        action: 'getProfessionals',
        additionalData: { filters, page, limit }
      })

      // Return empty result for network/server errors, throw for validation errors
      if (handledError instanceof ValidationError) {
        throw handledError
      }

      logger.error('Exception in getProfessionals', { metadata: { error: handledError } })
      return {
        professionals: [],
        totalCount: 0,
        hasMore: false
      }
    }
  }

  /**
   * Get professional by ID
   */
  async getProfessionalById(id: string): Promise<ProfessionalProfile | null> {
    try {
      const { data, error } = await supabase
        .from('professional_reviewers')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error) {
        logger.error('Failed to fetch professional by ID', { metadata: { error, id } })
        return null
      }

      if (!data) {
        return null
      }

      return {
        ...data,
        userId: data.user_id,
        fullName: data.full_name,
        licenseNumber: data.license_number,
        experience: data.experience_years
      }

    } catch (error) {
      const handledError = errorHandler.handle(error as Error, {
        component: 'ProfessionalService',
        action: 'getProfessionalById',
        additionalData: { professionalId: id }
      })

      logger.error('Exception in getProfessionalById', { metadata: { error: handledError } })

      // For user-facing calls, throw validation errors but return null for others
      if (handledError instanceof ValidationError) {
        throw handledError
      }

      return null
    }
  }

  /**
   * Search professionals by text query
   */
  async searchProfessionals(
    query: string,
    filters: ProfessionalFilters = {},
    page = 1,
    limit = 20
  ): Promise<ProfessionalSearchResult> {
    if (!query.trim()) {
      return this.getProfessionals(filters, page, limit)
    }

    try {
      let supabaseQuery = supabase
        .from('professional_reviewers')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .eq('verified', true)

      // Text search in multiple fields
      const searchTerm = `%${query.toLowerCase()}%`
      supabaseQuery = supabaseQuery.or(`
        full_name.ilike.${searchTerm},
        professional_title.ilike.${searchTerm},
        law_firm_name.ilike.${searchTerm},
        bio.ilike.${searchTerm}
      `)

      // Apply other filters
      if (filters.type) {
        supabaseQuery = supabaseQuery.eq('type', filters.type)
      }

      if (filters.jurisdiction) {
        supabaseQuery = supabaseQuery.eq('jurisdiction', filters.jurisdiction)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      supabaseQuery = supabaseQuery
        .range(from, to)
        .order('rating', { ascending: false })

      const { data, error, count } = await supabaseQuery

      if (error) {
        logger.error('Failed to search professionals', { metadata: { error, query } })
        throw error
      }

      const professionals: ProfessionalProfile[] = (data || []).map((prof: any) => ({
        ...prof,
        userId: prof.user_id,
        fullName: prof.full_name,
        licenseNumber: prof.license_number,
        experience: prof.experience_years
      }))

      return {
        professionals,
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1
      }

    } catch (error) {
      const handledError = errorHandler.handle(error as Error, {
        component: 'ProfessionalService',
        action: 'searchProfessionals',
        additionalData: { query, filters, page, limit }
      })

      logger.error('Exception in searchProfessionals', { metadata: { error: handledError } })

      // Throw validation errors, return empty for others
      if (handledError instanceof ValidationError) {
        throw handledError
      }

      return {
        professionals: [],
        totalCount: 0,
        hasMore: false
      }
    }
  }

  /**
   * Get available specializations for filtering
   */
  async getSpecializations(): Promise<Array<{ id: string; name: string; category: string }>> {
    try {
      // This would typically come from a specializations table
      // For now, extract unique specializations from professionals
      const { data, error } = await supabase
        .from('professional_reviewers')
        .select('specializations')
        .eq('status', 'active')
        .not('specializations', 'is', null)

      if (error) {
        logger.error('Failed to fetch specializations', { metadata: { error } })
        return []
      }

      // Extract and deduplicate specializations
      const allSpecializations = data
        .flatMap((prof: any) => prof.specializations || [])
        .filter(Boolean)

      const uniqueSpecializations = allSpecializations.reduce((acc: any[], spec: any) => {
        if (!acc.find((s: any) => s.id === spec.id)) {
          acc.push(spec)
        }
        return acc
      }, [] as Array<{ id: string; name: string; category: string }>)

      return uniqueSpecializations

    } catch (error) {
      logger.error('Exception in getSpecializations', { metadata: { error } })
      return []
    }
  }

  /**
   * Get available jurisdictions for filtering
   */
  async getJurisdictions(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('professional_reviewers')
        .select('jurisdiction')
        .eq('status', 'active')
        .not('jurisdiction', 'is', null)

      if (error) {
        logger.error('Failed to fetch jurisdictions', { metadata: { error } })
        return []
      }

      const jurisdictions: string[] = Array.from(new Set(
        data.map((prof: any) => prof.jurisdiction).filter(Boolean) as string[]
      )).sort()

      return jurisdictions

    } catch (error) {
      logger.error('Exception in getJurisdictions', { metadata: { error } })
      return []
    }
  }

  /**
   * Submit a request to work with a professional
   */
  async submitWorkRequest(
    professionalId: string,
    requestData: {
      projectType: string
      description: string
      timeline: string
      budget?: number
    }
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('professional_work_requests')
        .insert({
          professional_id: professionalId,
          client_id: (await supabase.auth.getUser()).data.user?.id,
          project_type: requestData.projectType,
          description: requestData.description,
          timeline: requestData.timeline,
          budget: requestData.budget,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        logger.error('Failed to submit work request', { metadata: { error } })
        return { success: false, error: error.message }
      }

      return { success: true, requestId: data.id }

    } catch (error) {
      logger.error('Exception in submitWorkRequest', { metadata: { error } })
      return { success: false, error: 'Failed to submit request' }
    }
  }
}

export const professionalService = new ProfessionalService()