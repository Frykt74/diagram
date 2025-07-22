namespace FlowchartApi.Models
{
    public class DiagramUpdateRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public object? JsonData { get; set; }
        public string? SvgData { get; set; }
    }
}
