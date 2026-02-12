// Mocking to fix build error as package is not present in this environment
export const vly = {
  ai: {
    completion: async (args: any) => ({ 
      success: false, 
      error: "Integration not available",
      data: null
    })
  }
};