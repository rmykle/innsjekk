/*Student.aggregate([
      {
        $project: {
          _id: 0,
          name: "$_id",
          score: 1,
          room: 1,
          score: 1,
          attendence: { $size: "$records" },
          historicResults: 1,
          week: {
            $filter: {
              input: "$records",
              as: "record",
              cond: {
                $eq: [
                  {
                    $isoWeek: { timezone: "Europe/Oslo", date: "$$record" }
                  },
                  {
                    $isoWeek: { timezone: "Europe/Oslo", date: new Date() }
                  }
                ]
              }
            }
          }
        }
      }
    ]).then(result =>
      resolve({
        type,
        nextTick,
        data: formatInput(result),
        registrerQueue: registrationQueue.map(person => ({
          name: person.name,
          room: person.room
        }))
      })
    );*/
