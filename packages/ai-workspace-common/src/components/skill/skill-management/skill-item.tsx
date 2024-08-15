import { useState } from 'react';
import { useUserStore } from '@refly-packages/ai-workspace-common/stores/user';
import { Avatar, Button, Typography, Divider, Form, Input } from '@arco-design/web-react';
import { useSkillManagement } from '@refly-packages/ai-workspace-common/hooks/use-skill-management';
import { InstanceDropdownMenu } from '@refly-packages/ai-workspace-common/components/skill/instance-dropdown-menu';
import { NewSkillInstanceModal } from '@refly-packages/ai-workspace-common/components/skill/new-instance-modal';

import { IconUser, IconPlayCircle, IconPlus, IconDelete } from '@arco-design/web-react/icon';

// 样式
import './skill-item.scss';
import { SkillTemplate, SkillInstance } from '@refly/openapi-schema';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { InstanceInvokeModal } from '@refly-packages/ai-workspace-common/components/skill/instance-invoke-modal';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

type source = 'instance' | 'template';
interface SkillItemProps {
  source: source;
  itemKey: number;
  isInstalled: boolean;
  showExecute?: boolean;
  refreshList?: () => void;
  postDeleteList?: (data: SkillInstance) => void;
}
interface SkillTempProsp extends SkillItemProps {
  data: SkillTemplate;
}
interface SkillInsProsp extends SkillItemProps {
  data: SkillInstance;
}
export const SkillItem = (props: SkillTempProsp | SkillInsProsp) => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const { localSettings } = userStore;
  const { handleAddSkillInstance, handleRemoveSkillInstance } = useSkillManagement();
  const { data, isInstalled, showExecute, source, itemKey, refreshList, postDeleteList } = props;

  const getSkillItemPopupContainer = () => {
    const elem = document.getElementById(`skillItem${itemKey}`);

    return elem as HTMLElement;
  };

  const goSkillDetail = () => {
    const { skillId } = data;
    if (source === 'template' || !skillId) {
      return;
    }
    navigate(`/skill-detail?skillId=${skillId}`);
  };

  const [visible, setVisible] = useState(false);
  const [invokeModalVisible, setInvokeModalVisible] = useState(false);
  const handleClickInvoke = (e) => {
    e.stopPropagation();
    setInvokeModalVisible(true);
  };

  return (
    <div id={`skillItem${itemKey}`}>
      <div className="skill-list-item" onClick={goSkillDetail}>
        <div className="skill-list-item__header">
          <div className="skill-list-item__profile">
            <Avatar size={40} shape="square" style={{ backgroundColor: '#00d0b6', borderRadius: 8 }}>
              {data?.displayName}
            </Avatar>
          </div>
          <div className="skill-list-item__title">
            <div className="skill-list-item__title-name">{data?.displayName}</div>
            <div className="skill-list-item__title-info">
              <span className="skill-list-item__title-info-item">
                <IconUser /> 99
              </span>
              <Divider type="vertical" />
              <span className="skill-list-item__title-info-item">
                <IconPlayCircle /> 1k
              </span>
            </div>
          </div>
        </div>

        <div className="skill-list-item__desc">
          <Typography.Paragraph ellipsis={{ rows: 3 }} style={{ lineHeight: 1.51 }}>
            {data?.description}
          </Typography.Paragraph>
        </div>

        <div className="skill-list-item__action">
          {showExecute && (
            <IconPlayCircle
              className="skill-list-item__action-icon"
              style={{ strokeWidth: 3 }}
              onClick={(e) => handleClickInvoke(e)}
            />
          )}
          {isInstalled ? (
            <InstanceDropdownMenu
              data={data}
              setUpdateModal={(val) => setVisible(val)}
              postDeleteList={postDeleteList}
              getSkillItemPopupContainer={getSkillItemPopupContainer}
            />
          ) : (
            <Button
              className="skill-list-item__action-btn skill-installer-install"
              type="outline"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(true);
              }}
            >
              <IconPlus />
              从模板创建
            </Button>
          )}
        </div>
      </div>
      <NewSkillInstanceModal
        type={source === 'template' ? 'new' : 'update'}
        data={data}
        visible={visible}
        setVisible={(val) => setVisible(val)}
        postConfirmCallback={refreshList}
      />
      <InstanceInvokeModal visible={invokeModalVisible} setVisible={(val) => setInvokeModalVisible(val)} data={data} />
    </div>
  );
};
