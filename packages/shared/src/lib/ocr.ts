/**
 * OCR Service using Tesseract.js
 * Alternative to Google Cloud Vision for MVP
 */

import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
  words?: Array<{
    text: string
    confidence: number
    bbox: {
      x0: number
      y0: number
      x1: number
      y1: number
    }
  }>
}

export class OCRService {
  private static instance: OCRService
  private worker: Tesseract.Worker | null = null

  private constructor() {}

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService()
    }
    return OCRService.instance
  }

  private async initWorker(): Promise<void> {
    if (this.worker) return

    this.worker = await Tesseract.createWorker('slk+ces+eng', 1, {
      logger: m => {
        if (process.env.NODE_ENV === 'development') {
          console.log('OCR Progress:', m)
        }
      }
    })
  }

  public async extractText(
    imageFile: File | string | ImageData,
    options: {
      languages?: string[]
      detectOrientation?: boolean
    } = {}
  ): Promise<OCRResult> {
    try {
      await this.initWorker()

      const { languages = ['slk', 'ces', 'eng'], detectOrientation = true } = options

      if (!this.worker) {
        throw new Error('OCR worker failed to initialize')
      }

      // Set languages
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÄÈÉÍÓÔÚÝáäèéíóôúýČčĎďĹĺĽľŇňŔŕŠšŤťŽž .,!?@#$%^&*()_+-={}[]|\\:";\'<>?/~`',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      })

      const result = await this.worker.recognize(imageFile)

      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence / 100, // Convert to 0-1 scale
        words: result.data.words?.map(word => ({
          text: word.text,
          confidence: word.confidence / 100,
          bbox: word.bbox
        }))
      }
    } catch (error) {
      console.error('OCR extraction failed:', error)
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  public async extractDocumentData(
    imageFile: File,
    documentType: 'passport' | 'id_card' | 'driver_license' | 'insurance' | 'contract' | 'general'
  ): Promise<{
    text: string
    confidence: number
    extractedFields: Record<string, string>
  }> {
    const ocrResult = await this.extractText(imageFile)

    // Simple field extraction based on document type
    const extractedFields = this.extractFieldsByType(ocrResult.text, documentType)

    return {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      extractedFields
    }
  }

  private extractFieldsByType(text: string, documentType: string): Record<string, string> {
    const fields: Record<string, string> = {}
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)

    switch (documentType) {
      case 'passport':
        // Look for passport-specific patterns
        const passportMatch = text.match(/([A-Z]{2}\d{6,9})|(\d{9})/g)
        if (passportMatch) fields.passportNumber = passportMatch[0]

        const nameMatch = text.match(/([A-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]+)\s+([A-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]+)/g)
        if (nameMatch) fields.fullName = nameMatch[0]
        break

      case 'id_card':
        // Slovak ID card patterns
        const idMatch = text.match(/\d{6}\/\d{4}/g)
        if (idMatch) fields.birthNumber = idMatch[0]
        break

      case 'insurance':
        // Look for policy numbers, amounts, dates
        const policyMatch = text.match(/\d{8,12}/g)
        if (policyMatch) fields.policyNumber = policyMatch[0]

        const amountMatch = text.match(/(\d+[.,]\d+)\s*(€|EUR|Kč|CZK)/gi)
        if (amountMatch) fields.amount = amountMatch[0]
        break

      default:
        // General document - extract dates, numbers, emails
        const dateMatch = text.match(/\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}/g)
        if (dateMatch) fields.date = dateMatch[0]

        const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/g)
        if (emailMatch) fields.email = emailMatch[0]

        const phoneMatch = text.match(/(\+\d{1,3}[\s\-]?)?\d{3}[\s\-]?\d{3}[\s\-]?\d{3,4}/g)
        if (phoneMatch) fields.phone = phoneMatch[0]
    }

    return fields
  }

  public async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}

// Export singleton instance
export const ocrService = OCRService.getInstance()