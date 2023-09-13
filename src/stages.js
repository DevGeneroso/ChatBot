import {
    STAGES,
    initialStage,
    stageOne,
    stageThree,
    stageTwo, 
    stageFour,
    stageFive
  } from './stages/index.js'
  
  import { storage } from './storage.js'
  
  export const stages = [
    {
      descricao: 'Welcome',
      stage: initialStage,
    },
    {
      descricao: 'Greetings',
      stage: stageOne
    },
    {
      descricao: 'First Menu',
      stage: stageTwo
    },
    {
      descricao: 'Second Menu',
      stage: stageThree
    },
    {
      descricao: 'Search Menu',
      stage: stageFour
    },
    {
      descricao: 'Final Stage',
      stage: stageFive
    }
  ]
  
  export function getStage({ from }) {
    if (storage[from]) {
      return storage[from].stage
    }
  
    storage[from] = {
      stage: STAGES.INITIAL,
      itens: [],
      address: '',
    }
  
    return storage[from].stage
  }