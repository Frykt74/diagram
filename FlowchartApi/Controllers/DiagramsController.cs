// Controllers/DiagramsController.cs
using FlowchartApi.Models;
using FlowchartApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace FlowchartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagramsController : ControllerBase
    {
        private readonly IDiagramService _diagramService;

        public DiagramsController(IDiagramService diagramService)
        {
            _diagramService = diagramService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiagramModel>>> GetAll()
        {
            var diagrams = await _diagramService.GetAllAsync();
            return Ok(diagrams);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DiagramModel>> GetById(int id)
        {
            var diagram = await _diagramService.GetByIdAsync(id);
            if (diagram == null)
                return NotFound();

            return Ok(diagram);
        }

        [HttpPost]
        public async Task<ActionResult<DiagramModel>> Create(DiagramCreateRequest request)
        {
            try
            {
                var diagram = await _diagramService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = diagram.Id }, diagram);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DiagramModel>> Update(int id, DiagramUpdateRequest request)
        {
            try
            {
                var diagram = await _diagramService.UpdateAsync(id, request);
                if (diagram == null)
                    return NotFound();

                return Ok(diagram);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _diagramService.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/export-svg")]
        public async Task<IActionResult> ExportSvg(int id)
        {
            var diagram = await _diagramService.GetByIdAsync(id);
            if (diagram == null)
                return NotFound();

            if (string.IsNullOrEmpty(diagram.SvgData))
                return BadRequest(new { message = "SVG data not available for this diagram" });

            var fileName = $"{diagram.Name.Replace(" ", "_")}_diagram.svg";
            return File(System.Text.Encoding.UTF8.GetBytes(diagram.SvgData),
                       "image/svg+xml", fileName);
        }
    }
}
