using System;
using System.Collections.Generic;

namespace ShoppingDBAPI.Models;

public partial class Product
{
    public int PId { get; set; }

    public string PName { get; set; } = null!;

    public string? PCategory { get; set; }

    public decimal PPrice { get; set; }

    public int PQty { get; set; }

    public bool PIsInStock { get; set; }
}
