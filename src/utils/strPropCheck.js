function strPropCheck(
  {
    props,
    propName,
    componentName
  },
  {
    reg,
    expectList
  },
  required = false
) {
    const propsExist = props[propName] !== undefined && props[propName] !== null;
    const strValid = propsExist ? reg.test(props[propName]) : required;
    const propsValid = (!propsExist || strValid);
    const err = `Invalid prop '${props[propName]}' supply to '${propName}', Validation failed on component ${componentName}, Expecting ${expectList.join(', ')} supply to '${propName}'.`; // eslint-disable-line
    if (required && !propsExist) {
      return new Error(`'${propName}' is marked as required.`);
    } else if (!propsValid) {
      return new Error(err);
    }
  }

export { strPropCheck };
