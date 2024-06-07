# Assignment-2

here, I will show you the requirement of an *assignment 2!*

## specifications 

> using mongoose and express

 - users collection -->schema [ userName , email , password hashed , age , gender , phone] 
 - tasks collection -->schema [ title , description , status {toDo , doing , done} , userId , assignTo , deadline ] 

 - don't forget to get user id from token

## Modules

> User APIs :

 1. signUp
 2. login-->with create token
 3. change password (user must be logged in)
 4. update user (age , firstName , lastName)(user must be logged in)
 5. delete user(user must be logged in)
 6. soft delete(user must be logged in)
 7. logout


> Task  APIs : 
 1. add task with status (toDo)(user must be logged in)
 2. update task (title , description , status) and assign task to other user(user must be logged in) (creator only can update task)
 3. delete task(user must be logged in) (creator only can delete task)
 4. get all tasks with user data
 5. get tasks of oneUser with user data (user must be logged in)
 6. get all tasks of oneUser with user data
 7. get all tasks that not done after deadline

 
## Additional requirement

 - confirm email
 - Bearer token
 - unsubscribe  by email 
 - validation (Joi)
 -  .ENV
