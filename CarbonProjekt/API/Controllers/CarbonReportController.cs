
using System.Diagnostics.Metrics;
using Application.CarbonReports.Commands;
using Application.CarbonReports.Queries;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class CarbonReportController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<CarbonReportDto>> Create(CreateCarbonReport.Command command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }
        [HttpGet]
        public async Task<ActionResult<CarbonReportDto>> GetList()
        {
            var results = await mediator.Send(new GetCarbonReportList.Query());
            return Ok(results);
        } 
/*         [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(new { message = "Erfolg!" });
        }
 */
        [HttpGet("{id}")]
        public async Task<ActionResult<CarbonReportDto>> GetDetails(Guid id)
        {
            var carbonReport = await mediator.Send(new GetCarbonReportDetails.Query {Id = id});
            if(carbonReport == null ) throw new Exception("carbon report not found");
            return Ok(carbonReport);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            await mediator.Send(new DeleteCarbonReport.Command {Id = id});
            return NoContent();
        }


        [HttpPut("{id}")]
        public async Task<ActionResult> Edit(Guid id, [FromBody] EditCarbonReport.Command command)
        {
            command.Id = id;
            await mediator.Send(command);
            return Ok();
        }
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> DownloadPdf(Guid id)
        {
            byte[] result = await mediator.Send(new GetCarbonReportPdfQuery(id));
            
            if (result == null) return NotFound();

            // HIER wird das Byte-Array übergeben (z.B. aus der Eigenschaft "Content")
            return File(result, "application/pdf", $"Bericht_{id}.pdf");
        }


    }
}