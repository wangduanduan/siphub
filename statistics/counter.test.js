const {getStat,getPeekStat,update,setMaxPackageSize,getMaxPackageSize}=require('./counter')
  
test('getStat', () => {
    expect(getStat()).toStrictEqual({
        "db_insert_all": 0,
       "hep_drop_all": 0,
       "hep_receive_all": 0,
    })
    update('db_insert_all')
    expect(getStat()).toStrictEqual({
        "db_insert_all": 1,
       "hep_drop_all": 0,
       "hep_receive_all": 0,
    })
    update('hep_drop_all')
    expect(getStat()).toStrictEqual({
        "db_insert_all": 1,
       "hep_drop_all": 1,
       "hep_receive_all": 0,
    })
    update('hep_receive_all')
    expect(getStat()).toStrictEqual({
        "db_insert_all": 1,
       "hep_drop_all": 1,
       "hep_receive_all": 1,
    })
})


test('getSetMaxPackageSize', () => {
    expect(getMaxPackageSize()).toBe(0)
    setMaxPackageSize(8)
    expect(getMaxPackageSize()).toBe(8)
    setMaxPackageSize(0)
    expect(getMaxPackageSize()).toBe(8)
})
