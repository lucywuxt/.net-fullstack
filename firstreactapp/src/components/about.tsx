import './about.css'

function About(){
    const orgName = "Cognizant";
    const productList = ["Cognizant Cloud", "Cognizant Digital Engineering", "Cognizant AI & Analytics", "Cognizant Consulting"];
    return (
        <>
            <h1> About Page </h1>
            <p>this is the about page</p>

            <p> Organization {orgName} </p>

            <p>Product List:</p>

            <select>
                {productList.map((product, index) => (
                    <option key={index} value={product}>
                        {product}
                    </option>
                ))}
            </select>

        </>
    )
}
export default About;