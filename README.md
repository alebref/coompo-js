# Coompo.js
v1.0.2

`npm install`: Install required packages

`npm test`: Run unit tests

`npm run build` : Translate coompo.js into old-browsers-compatible JavaScript (output directory `dist/`)

## What is Coompo ?
Coompo is a JavaScript library helping building reactive web pages with a components system handling properties (props) and events.

## Create a component with `Coompo.Component`
Needs a `name` and a `props` and a `render` fields.

```javascript
const title = Coompo.Component({
    name: 'title',
    props: {
        text: { required: true }
    },
    render: (props) => `<h1>${ props.text }</h1>`
})
```

`name` is used to identify the component.

`props` contains the names and the default values of the props.

`render` is the function describing the HTML rendering of the component. We can include sub-components there.

Components are automatically re-rendered when their props are changed.

## Props : set a required or a default value

```javascript
props: {
    title: { required: true },
    author: { default: '(Unknown)' }
}
```

## Props : validate with `validator`

```javascript
const validateName = (value) =>
{
    const errors = []
    if (value.length < 1) { errors.push('A name must contain at least one character') }
    if (!/^[A-Za-z]+$/.test(value)) { errors.push('A name must contain only letters') }
    return errors
}
const person = Coompo.Component({
    name: 'name',
    props: {
        text: { default: '', validator: validateName }
    },
    render: (props) => `<p>${ props.name }</p>`
})
```

The validator must return an array of strings. It is empty if there aren't validation errors. Otherwise it contains the error messages.

See the `propValidation` event section below.

## Include and initialize a component with `of(props)`
```javascript
const title = Coompo.Component({ /* ... */ })

const paragraph = Coompo.Component({ /* ... */ })

const nextSectionButton = Coompo.Component({ /* ... */ })

const section = Coompo.Component({
    /* ... */
    props: {
        title: { default: 'Untitled' },
        paragraphs: { default: [] }
    },
    render: (props) =>

`<section>
    ${ title.of({ text: props.title }) }
    ${ (props.paragraphs ?? []).map(p => paragraph.of({ text: p })).join('') }
    ${ nextSectionButton.of() }
</section>`

})
```

## Launch Coompo with `Coompo.compose()`

### Prepare a placeholder in the HTML document with the `coompo-root` attribute...
```html
<body>
    <!-- ... -->
    <div coompo-root></div>
    <!-- ... -->
</body>
```

### ... then `compose()` in a script after linking `compo.js`
```javascript
Coompo.compose(myRootComponent)
```

## Double-binding with `coompo-is`
You can use double-binding between an input's value and a component's prop :

1. Modifying the value will also modify the prop

2. Modifying the prop will also modify the value

```javascript
const hello = Coompo.Component({
    /* ... */
    props: {
        name: { default: '' }
    },
    render: (props) =>

`<form>
    <input coompo-is="name" />
    <div>Hello ${ props.name } !</div>
</form>`

})
```

## React to HTML events with the `on` field of a component
```javascript
const title = Coompo.Component({
    /* ... */
    on: {
        click: (props) => console.log(props)
    }
})
```

## The `propChange` event
The `propChange` event is triggered when a prop's value has changed. Its arguments are :

1. the prop's name
2. the new value of the prop
3. the old value of the prop


```javascript
const game = Coompo.Component({
    /* ... */
    props: {
        winner: { default: null }
    }
    on: {
        propChange: (prop, newValue, oldValue) =>
        {
            if (prop === 'winner')
            {
                console.log(`Now the winner is ${newValue} !`)
            }
        }
    }
})
```

## The `propValidation` event
The `propValidation` event is triggered when a prop's value has been validated (on component first rendering, then at each prop change).
Its arguments are :

1. the prop's name
2. the value of the prop
3. an indicator that is `true` if the value is valid, `false` if it is invalid
4. the list of the error messages (one for each criterion of validation that hasn't been respected)


```javascript
const state = {
    nameErrors: [],
    ageErrors: []
}

const errorsToComponents = (errors) => errors.length > 0
    ? errors.map(e => error.of({ text: e })).join('')
    : ''

const form = Coompo.Component({
    name: 'form',
    props: {
        firstname: { default: '', validator: validateName },
        age: { default: '', validator: validateAge }
    },
    on: {
        propValidation: (prop, value, isValid, errors) => 
        {
            console.log('propValidation', prop, value, isValid, errors)
            if (prop === 'firstname') { state.nameErrors = errors }
            else { state.ageErrors = errors }
        }
    },
    render: () =>

`<form>
    <div>
        <label for="firstname">First name</label>
        <input id=firstname" coompo-is="firstname" />
        ${ errorsToComponents(state.nameErrors) }
    </div>
    <div>
        <label for="age">Age</label>
        <input id=age" coompo-is="age" />
        ${ errorsToComponents(state.ageErrors) }
    </div>
</form>`
```

## Custom events

### Emit a custom event with `Coompo.emit()`...
```javascript
const startButton = Coompo.Component({
    /* ... */
    on: {
        click: () => Coompo.emit('start')
    }
})
```

### ... then react to the event with `on[@event]` 
```javascript
const app = Coompo.Component({
    /* ... */
    on: {
        '@start': (props) => props.started = true
    }
})
```

### Pass data through the event...
```javascript
Coompo.emit('my-event', { dummy: 42 })
```

### ...then get the data
```javascript
on: {
    '@my-event': (props, data) => props.dummy = data.dummy
}
```

### Memoization with `memoKey`
Memoization allow faster re-rendering of components that are often rendered with the same props' values.

It is useful with complex components, when computing a key is faster than re-computing the rendering.

An in-memory map stores for each props configuration met the rendering expected.

The optional `memoKey` field of a component is a function used to compute the keys of such a map.

It has one argument : the components's props.

And it should return a simple value (`undefined` or `null` or a boolean or a number or a string).

```javascript
const cell = Coompo.Component({
    name: 'cell',
    props: {
        active: { required: true }
    },
    render: (props) => `<div class="cell ${ props.active ? 'active' : '' }"></div>`,
    memoKey: (props) => props.active
})
```
