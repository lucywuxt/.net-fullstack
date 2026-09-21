namespace BankingApp.Models;

public class ServiceRequest
{
    public int Id { get; set; }              // this is the "request id" shown to the customer
    public int AccountId { get; set; }
    public Account? Account { get; set; }

    public string RequestType { get; set; } = "Cheque Book";
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public DateTime RequestedOn { get; set; } = DateTime.Now;
    public DateTime? ProcessedOn { get; set; }
}
