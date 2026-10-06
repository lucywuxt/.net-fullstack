import React from 'react'
import './home.css'

class Home extends React.Component {
    // every component must have a render method which return JSX
    render() {
        const firstName = "Wucy" // this will come from REST API in the future
        const lastName = "Lu"
        const skills = ["HTML", "CSS", "JavaScript", "React", "Node.js"]
    // in the render method, always need a return statement that return a single JSX element.
    // If you want to return multiple elements, you must wrap them in a single parent element. 
    // You can use a div or a React Fragment (<> </>) as the parent element.
        return (
            <div>
                <h1>this is my home component</h1>
                <p>this is a component crated with class-based components in React</p>
                <h2>keep checking this space for more updates</h2>

                <p> some jsx expression </p>
                <p> Addition of numbers: {5 + 10}</p>
                <p> Is 5 greater than 10? {5 > 10 ? "Yes" : "No"}</p>
                <p> Welcome, {firstName} {lastName}!</p>
                <h3> My Skills are: </h3>
                <ul>
                    {skills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                    ))}
                </ul>
            </div>
        )
    }
}

export default Home