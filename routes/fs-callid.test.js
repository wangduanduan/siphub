const {checkQuery,find}=require('./fs-callid')


test('checkQuery',()=>{
    expect(checkQuery('','')).not.toBeTruthy()
    expect(checkQuery('','2020_10_01')).toBeFalsy()
    expect(checkQuery('cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW','')).toBeFalsy()
    expect(checkQuery('','20201001')).toBeFalsy()
    expect(checkQuery('cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW','2020_10_01')).toBeTruthy()
    expect(checkQuery('cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW','2020_80_80')).toBeFalsy()
})