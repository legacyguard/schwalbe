// A light integration-style test for the upload flow
// This uses jest mocks for supabase client. Real E2E is covered in Playwright.

describe('document upload and analyze', () => {
  it('should insert doc, upload storage, invoke function, update doc, and create reminder (best-effort)', async () => {
    // Mock supabase client used in documentApi.ts
    jest.resetModules()
    const mockInsert = jest.fn().mockReturnValue({ select: () => ({ single: () => ({ data: { id: 'doc-1' } }) }) })
    const mockUpdate = jest.fn().mockReturnValue({ eq: () => ({ select: () => ({ single: () => ({ data: { id: 'doc-1', expiration_date: '2025-12-31' } }) }) }) })
    const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'user-1/doc-1/file.pdf' } })
    const mockInvoke = jest.fn().mockResolvedValue({ data: { result: { extractedText: 'Valid until 2025-12-31', confidence: 0.9, suggestedCategory: { category: 'legal', confidence: 0.8, icon: 'scale', reasoning: 'found terms' }, suggestedTitle: { title: 'Contract', confidence: 0.7, reasoning: 'filename' }, expirationDate: { date: '2025-12-31', confidence: 0.8, reasoning: 'found date' }, keyData: [], suggestedTags: [], processingId: 'p1', processingTime: 10 } } })
    const mockAuth = { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) }

    jest.doMock('@/lib/supabase', () => ({
      supabase: {
        auth: mockAuth,
        from: () => ({ insert: mockInsert, update: mockUpdate }),
        storage: { from: () => ({ upload: mockUpload }) },
        functions: { invoke: mockInvoke },
      },
    }))

    // Mock shared package to avoid initializing real Supabase client from shared supabase/client
    jest.doMock('@schwalbe/shared', () => ({
      reminderService: {
        create: jest.fn().mockResolvedValue({ id: 'rule-1' }),
      },
    }), { virtual: true })

    // Dynamically import after mocking so the module under test uses our mock
    const { uploadDocumentAndAnalyze } = await import('../features/documents/api/documentApi')

    const file = new File([new Uint8Array([1,2,3])], 'file.pdf', { type: 'application/pdf' })
    const { document } = await uploadDocumentAndAnalyze(file)

    expect(document.id).toBe('doc-1')
    expect(mockUpload).toHaveBeenCalled()
    expect(mockInvoke).toHaveBeenCalledWith('intelligent-document-analyzer', expect.anything())
  })
})
