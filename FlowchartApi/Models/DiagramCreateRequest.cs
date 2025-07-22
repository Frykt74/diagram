namespace FlowchartApi.Models
{
    public class DiagramCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public object JsonData { get; set; } = new();
        public string? SvgData { get; set; }
    }
}