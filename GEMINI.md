# Kite Surf Lesson Tracking App

this is a developpment app, with the goal to have a minimal viable product (MVP) that users can use.
this is a nextjs, so if we make a client compoennt, it must have 'use client' at the top of the file

There are 2 types of users, each time a client makes a request to the server, we check the db to see if the pk, UID belongs to a teacher (UID). if so role = teacher, else | admin, teacherAdmin | guest

- admin
- teachers

teachers track their hours, while admin set lesson schedule.

## IMportant

- no color should be added if not specified NO BG
- this is an nextjs app, following the rails conventions
  -- model (where we define the model, logic and drizzle schema)
  -- view (ui components, represented by model dir)
  -- controler (our logic and event handling for CRUD api calls)
- inside the actions dir we have the api calls to the supabase db

## Arquitech

- we want to use the server as much as posible, then pass into client compoenents if needed.
- all logic is best declared at the top of the document/function, where the parent componentn renders children, most readibility
- look at the README to yunderstand how each model works, and its intented functionality (marked as ### after entity)
