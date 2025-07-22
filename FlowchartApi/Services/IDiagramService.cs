using FlowchartApi.Models;

namespace FlowchartApi.Services
{
    public interface IDiagramService
    {
        Task<IEnumerable<DiagramModel>> GetAllAsync();
        Task<DiagramModel?> GetByIdAsync(int id);
        Task<DiagramModel> CreateAsync(DiagramCreateRequest request);
        Task<DiagramModel?> UpdateAsync(int id, DiagramUpdateRequest request);
        Task<bool> DeleteAsync(int id);
    }
}
