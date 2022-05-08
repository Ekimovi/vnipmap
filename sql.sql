insert into rels select id, 
    case 
        when a_id > b_id 
            then a_id
            else b_id
    end as a_id,
    case 
        when a_id > b_id 
            then a_port
            else b_port
    end as a_port,
    case 
        when a_id > b_id 
            then b_id
            else a_id
    end as b_id,
    case 
        when a_id > b_id 
            then b_port
            else a_port
    end as b_port,
    case 
        when a_id > b_id 
            then a_type
            else b_type
    end as a_type,
    case 
        when a_id > b_id 
            then b_type
            else a_type
    end as b_type,
    source
    from nipmap_rels;