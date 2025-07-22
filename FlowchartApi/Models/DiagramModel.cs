using System.ComponentModel.DataAnnotations;

namespace FlowchartApi.Models
{
    public class DiagramModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string JsonData { get; set; } = string.Empty;

        public string? SvgData { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
