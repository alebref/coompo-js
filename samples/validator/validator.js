"use strict"

const validateName = (value) =>
{
    const errors = []
    if (value.length < 1) { errors.push('A name must contain at least one character') }
    if (!/^[A-Za-z]+$/.test(value)) { errors.push('A name must contain only letters') }
    return errors
}

const validateAge = (value) =>
{
    const errors = []
    let toStringAsNumber = Number(value).toString()
    if (toStringAsNumber === 'NaN') { errors.push('This is not a number !') }
    if (!/^\d+$/.test(value)) {  errors.push('An age should be a positive integer') }
    if (toStringAsNumber > 120) { errors.push('A valid age should be less than 121') }
    return errors
}

const state = {
    nameErrors: [],
    ageErrors: []
}

const error = Coompo.Component({
    name: 'error',
    props: {
        text: { required: true }
    },
    render: (props) =>
 
`<p class="error">${ props.text }</p>`

})

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
        propChange: (prop, newValue, oldValue) =>
        {
            console.log('propChange', prop, newValue, oldValue)
        },
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

})


Coompo.compose(form)
