namespace BankingApp.Menus;

/// <summary>Template-method base class: subclasses supply the menu text and the choice handling.</summary>
public abstract class MenuBase
{
    protected abstract void Display();

    /// <returns>false when the user chose Exit.</returns>
    protected abstract bool Handle(string choice);

    public void Run()
    {
        while (true)
        {
            Display();
            Console.Write("Enter your choice: ");
            var choice = (Console.ReadLine() ?? string.Empty).Trim();

            if (!Handle(choice))
                break;
        }
    }
}
