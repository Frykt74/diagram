using FlowchartApi.Data;
using FlowchartApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FlowchartApi.Services
{
    public class DiagramService : IDiagramService
    {
        private readonly ApplicationDbContext _context;

        public DiagramService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DiagramModel>> GetAllAsync()
        {
            return await _context.Diagrams
                .OrderByDescending(d => d.UpdatedAt)
                .ToListAsync();
        }

        public async Task<DiagramModel?> GetByIdAsync(int id)
        {
            return await _context.Diagrams.FindAsync(id);
        }

        public async Task<DiagramModel> CreateAsync(DiagramCreateRequest request)
        {
            var diagram = new DiagramModel
            {
                Name = request.Name,
                Description = request.Description,
                JsonData = JsonSerializer.Serialize(request.JsonData),
                SvgData = request.SvgData,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Diagrams.Add(diagram);
            await _context.SaveChangesAsync();

            return diagram;
        }

        public async Task<DiagramModel?> UpdateAsync(int id, DiagramUpdateRequest request)
        {
            var diagram = await _context.Diagrams.FindAsync(id);
            if (diagram == null) return null;

            if (!string.IsNullOrEmpty(request.Name))
                diagram.Name = request.Name;

            if (request.Description != null)
                diagram.Description = request.Description;

            if (request.JsonData != null)
                diagram.JsonData = JsonSerializer.Serialize(request.JsonData);

            if (request.SvgData != null)
                diagram.SvgData = request.SvgData;

            diagram.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return diagram;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var diagram = await _context.Diagrams.FindAsync(id);
            if (diagram == null) return false;

            _context.Diagrams.Remove(diagram);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
