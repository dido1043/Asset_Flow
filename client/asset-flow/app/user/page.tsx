import React from "react";

interface User {
  id:number,
  fullName:string,
  email:string,
  password:string,
  role:string,
  age:number,
  organizationId:number,
  assignmentIds:Array<number>
}

const UserPage = async() => {
  const response = await fetch(`${process.env.API_URL}/auth/users`);
  const data = await response.json();
  console.log("Users:", data);

  const users: Array<User> = data;

  return (
    <div>
      <h1>User Page</h1>
      <ul>
        {
          users.map(u =>(
            <li key={u.id}>{u.fullName} - {u.age}</li>
          ))
        }
      </ul>
    </div>
  );
};

export default UserPage;
