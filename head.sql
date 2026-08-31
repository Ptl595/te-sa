select  t1.fid             								as fid				--内码
	   ,t1.fbillno         								as vchr_cd			--单据编码
	   ,t1.fdate             							as dt				--日期
	   ,case when t1.fdocumentstatus ='A' then '创建'  
	   		 when t1.fdocumentstatus ='B' then '审核中'  
	   		 when t1.fdocumentstatus ='C' then '已审核'  
	   		 when t1.fdocumentstatus ='D' then '重新审核'  
	   		 when t1.fdocumentstatus ='Z' then '暂存'  
	   		 end                       					as vchr_stat  		--单据状态
	   ,t1.FSTOCKORGID             						as sndmtrl_org_id	--发料组织编号
	   ,t2_1.fname                 				  		as sndmtrl_org_nm	--发料组织名称
	   ,t1.FPRDORGID               						as prod_org_id		--生产组织编号
	   ,t2_2.fname                 				 		as prod_org_nm		--生产组织名称
	   ,t1_l.fdescription          				 		as rmk				--备注
	   ,t1.FOWNERID                				 		as frgt_mstr_id		--货主编号
	   ,t3.frgt_mstr_nm                            		as frgt_mstr_nm 	--货主名称
	   ,case when t1.FOWNERTYPEID='BD_OwnerOrg' then '业务组织'
	   		 when t1.FOWNERTYPEID='BD_Supplier' then '供应商'
	   		 when t1.FOWNERTYPEID='BD_Customer' then '客户'
	   		 end                          				as frgt_mstr_typ	--货主类型
from ods.ods_erp_T_PRD_PICKMTRL    t1
left join ods.ods_erp_T_PRD_PICKMTRL_L   t1_l   on  t1.fid=t1_l.fid
--组织
left join ods.ods_erp_t_org_organizations_l  t2_1   on  t2_1.forgid=t1.FSTOCKORGID 
left join ods.ods_erp_t_org_organizations_l  t2_2   on  t2_2.forgid=t1.FPRDORGID  
--货主名称   
left join (select  a.forgid as frgt_mstr_org_id    --货主组织编号
				   ,a.flocaleid,           		--语言
					a.fname as frgt_mstr_nm        --货主名称
			from ods.ods_erp_t_org_organizations_l  a
			left join ods.ods_erp_t_org_organizations  b  on b.forgid=a.forgid
			where b.fuseorgid IN (38778833, 65773138, 7445369, 10184160, 
			 31292991, 12942914, 110002, 64221134, 11460716) 
			union all 
			select c1.fsupplierid,c1.flocaleid,c1.fname 
			from ods.ods_erp_t_bd_supplier_l c1
			left join ods.ods_erp_t_bd_supplier c2 on c2.FSUPPLIERID=c1.FSUPPLIERID
			where c2.fuseorgid IN (38778833, 65773138, 7445369, 10184160, 
 			31292991, 12942914, 110002, 64221134, 11460716) 
			union all
			select d1.fcustid,d1.flocaleid,d1.fname  from ods.ods_erp_t_bd_customer_l  d1
			left join ods.ods_erp_t_bd_customer  d2 on d2.fcustid=d1.fcustid
			where d2.fuseorgid IN (38778833, 65773138, 7445369, 10184160, 
			 31292991, 12942914, 110002, 64221134, 11460716) 
			)  t3   on t3.frgt_mstr_org_id=t1.fownerid
where t1.FSTOCKORGID in (38778833, 65773138, 7445369, 10184160, 31292991, 12942914, 110002, 64221134, 11460716) 