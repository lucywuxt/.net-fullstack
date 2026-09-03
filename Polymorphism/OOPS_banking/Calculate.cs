namespace Calculate
{
    public class Calculation
    {
        // Method Overloading
        // public int Add(int num1, int num2)
        // {
        //     return num1 + num2;
        // }

        // public int Add(int num1, int num2, int num3)
        // {
        //     return num1 + num2 + num3;
        // }
        
        // Params Array
        public int Add(int num1, int num2, params int[] more)
        {
            int result = num1 + num2;
            for(int i = 0; i < more.Length; i++)
            {
                result += more[i];
            }
            return result;
        }
    }
}